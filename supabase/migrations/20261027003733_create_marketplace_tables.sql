/*
# Marketplace: shops, subscriptions, driver applications, plans

## Summary
Creates the core tables for the Course CI marketplace:
- shops (merchant boutiques with approval workflow)
- subscription_plans (admin-configurable pricing for daily/monthly)
- merchant_subscriptions (payment tracking + activation status)
- driver_applications (recruitment with approval workflow)
- admin_audit_log (journal of sensitive admin actions)

## Security
- All tables have RLS enabled.
- Shops: public SELECT for approved shops only; owner can CRUD own shop.
- Subscription plans: public SELECT; only admin can INSERT/UPDATE/DELETE.
- Merchant subscriptions: owner can SELECT/INSERT own; admin can SELECT all + UPDATE status.
- Driver applications: applicant can SELECT/INSERT/UPDATE own; admin can SELECT all + UPDATE status.
- Admin audit log: only admin can SELECT/INSERT.
- Admin role is verified via a SECURITY DEFINER function `is_admin()` checking raw_app_meta_data->>'role' = 'admin'.
- No public admin registration is possible through any table or policy.
*/

-- Helper function: check if current user is admin (role stored in app_metadata, user-immutable)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ─── Shops ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  business_type text NOT NULL,
  description text,
  address text NOT NULL,
  commune text NOT NULL,
  logo_url text,
  cover_url text,
  gallery_urls text[] DEFAULT '{}',
  opening_hours text,
  whatsapp_number text,
  contact_phone text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON shops TO anon, authenticated;
GRANT INSERT, UPDATE ON shops TO authenticated;

-- Public can only see approved + active shops
DROP POLICY IF EXISTS "public_read_approved_shops" ON shops;
CREATE POLICY "public_read_approved_shops"
ON shops FOR SELECT
TO anon, authenticated
USING (is_approved = true AND is_active = true);

-- Owner can see and manage their own shop (even unapproved)
DROP POLICY IF EXISTS "owner_read_own_shop" ON shops;
CREATE POLICY "owner_read_own_shop"
ON shops FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner_insert_own_shop" ON shops;
CREATE POLICY "owner_insert_own_shop"
ON shops FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner_update_own_shop" ON shops;
CREATE POLICY "owner_update_own_shop"
ON shops FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Admin can manage all shops
DROP POLICY IF EXISTS "admin_manage_shops" ON shops;
CREATE POLICY "admin_manage_shops"
ON shops FOR SELECT
TO authenticated
USING (public.is_admin());

-- ─── Subscription Plans (admin-configurable) ───────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('daily', 'monthly')),
  price_fcfa integer NOT NULL DEFAULT 0,
  duration_hours integer NOT NULL,
  includes_delivery boolean NOT NULL DEFAULT false,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON subscription_plans TO anon, authenticated;

-- Public can read active plans
DROP POLICY IF EXISTS "public_read_plans" ON subscription_plans;
CREATE POLICY "public_read_plans"
ON subscription_plans FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Only admin can create/update/delete plans
DROP POLICY IF EXISTS "admin_manage_plans_select" ON subscription_plans;
CREATE POLICY "admin_manage_plans_select"
ON subscription_plans FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_plans" ON subscription_plans;
CREATE POLICY "admin_insert_plans"
ON subscription_plans FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_plans" ON subscription_plans;
CREATE POLICY "admin_update_plans"
ON subscription_plans FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_plans" ON subscription_plans;
CREATE POLICY "admin_delete_plans"
ON subscription_plans FOR DELETE
TO authenticated
USING (public.is_admin());

-- Seed default plans
INSERT INTO subscription_plans (id, name, plan_type, price_fcfa, duration_hours, includes_delivery, description, sort_order)
VALUES
  ('daily', 'Formule journalière', 'daily', 1000, 24, false, 'Publiez votre boutique pendant 24 heures. Livraison Course CI non incluse.', 1),
  ('monthly', 'Formule mensuelle', 'monthly', 15000, 720, true, 'Publiez votre boutique pendant 30 jours. Livraison Course CI incluse pour les commandes éligibles.', 2)
ON CONFLICT (id) DO NOTHING;

-- ─── Merchant Subscriptions (payment tracking) ─────────────────────────
CREATE TABLE IF NOT EXISTS merchant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES subscription_plans(id),
  merchant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'active', 'expired', 'refunded')),
  amount_fcfa integer NOT NULL,
  activated_at timestamptz,
  expires_at timestamptz,
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE merchant_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON merchant_subscriptions TO authenticated;

-- Merchant can see their own subscriptions
DROP POLICY IF EXISTS "merchant_read_own_subs" ON merchant_subscriptions;
CREATE POLICY "merchant_read_own_subs"
ON merchant_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = merchant_id);

-- Merchant can create a pending subscription (cannot set status to active themselves)
DROP POLICY IF EXISTS "merchant_insert_own_subs" ON merchant_subscriptions;
CREATE POLICY "merchant_insert_own_subs"
ON merchant_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = merchant_id AND payment_status = 'pending');

-- Merchant can only update payment_reference on their own pending subs (NOT status)
DROP POLICY IF EXISTS "merchant_update_own_subs" ON merchant_subscriptions;
CREATE POLICY "merchant_update_own_subs"
ON merchant_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = merchant_id AND payment_status = 'pending')
WITH CHECK (auth.uid() = merchant_id AND payment_status = 'pending');

-- Admin can see all subscriptions and update status
DROP POLICY IF EXISTS "admin_read_subs" ON merchant_subscriptions;
CREATE POLICY "admin_read_subs"
ON merchant_subscriptions FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_subs" ON merchant_subscriptions;
CREATE POLICY "admin_update_subs"
ON merchant_subscriptions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ─── Driver Applications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  commune text NOT NULL,
  work_zone text,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('moto', 'velo', 'voiture', 'autre')),
  availability_hours text,
  experience text,
  profile_photo_url text,
  id_document_type text,
  id_document_number text,
  document_urls text[] DEFAULT '{}',
  license_url text,
  message_to_admin text,
  application_status text NOT NULL DEFAULT 'draft' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'info_requested', 'accepted', 'rejected')),
  admin_response text,
  application_number text UNIQUE,
  is_activated boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE driver_applications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON driver_applications TO authenticated;

-- Applicant can see and manage their own application
DROP POLICY IF EXISTS "applicant_read_own" ON driver_applications;
CREATE POLICY "applicant_read_own"
ON driver_applications FOR SELECT
TO authenticated
USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "applicant_insert_own" ON driver_applications;
CREATE POLICY "applicant_insert_own"
ON driver_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_id);

-- Applicant can update their own draft/submitted applications (but NOT status to accepted)
DROP POLICY IF EXISTS "applicant_update_own" ON driver_applications;
CREATE POLICY "applicant_update_own"
ON driver_applications FOR UPDATE
TO authenticated
USING (auth.uid() = applicant_id)
WITH CHECK (auth.uid() = applicant_id AND application_status NOT IN ('accepted', 'rejected'));

-- Admin can see all applications and update status
DROP POLICY IF EXISTS "admin_read_applications" ON driver_applications;
CREATE POLICY "admin_read_applications"
ON driver_applications FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_applications" ON driver_applications;
CREATE POLICY "admin_update_applications"
ON driver_applications FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ─── Admin Audit Log ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read the audit log
DROP POLICY IF EXISTS "admin_read_audit" ON admin_audit_log;
CREATE POLICY "admin_read_audit"
ON admin_audit_log FOR SELECT
TO authenticated
USING (public.is_admin());

-- Any authenticated user can write to audit log (but typically only admins will)
DROP POLICY IF EXISTS "authenticated_insert_audit" ON admin_audit_log;
CREATE POLICY "authenticated_insert_audit"
ON admin_audit_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);

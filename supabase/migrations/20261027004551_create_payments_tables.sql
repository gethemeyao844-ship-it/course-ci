/*
# Payments, transactions, and admin credentials

## Summary
Creates the payment infrastructure for Course CI:
- payment_methods: admin-configured payment providers (CinetPay channels: Wave, Orange Money, MTN MoMo, Moov Money, Visa, Mastercard). Only enabled methods are shown to users.
- transactions: every payment attempt (orders, subscriptions, promotional services) with full lifecycle tracking and idempotency protection.
- admin_credentials: server-side admin password hashes. Used by the admin-login edge function to verify admin access. No plaintext passwords are stored.

## Security
- payment_methods: public SELECT for enabled methods only; admin can CRUD all.
- transactions: owner can SELECT/INSERT own; admin can SELECT all + UPDATE status. No client can set status to 'succeeded' — only the server (edge function via service role) can.
- admin_credentials: NO public access. Only the admin-login SECURITY DEFINER edge function reads this table via service role. RLS denies all direct access from anon/authenticated.
- Idempotency: transactions.reference is UNIQUE. Duplicate webhook deliveries for the same reference are ignored.
*/

-- ─── Payment Methods (admin-configured) ────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'cinetpay',
  channel text,
  logo_url text,
  display_order integer DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT false,
  supports_subscription boolean NOT NULL DEFAULT true,
  supports_order boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON payment_methods TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON payment_methods TO authenticated;

-- Public can only see enabled methods
DROP POLICY IF EXISTS "public_read_enabled_methods" ON payment_methods;
CREATE POLICY "public_read_enabled_methods"
ON payment_methods FOR SELECT
TO anon, authenticated
USING (is_enabled = true);

-- Admin can see all methods (including disabled)
DROP POLICY IF EXISTS "admin_read_all_methods" ON payment_methods;
CREATE POLICY "admin_read_all_methods"
ON payment_methods FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can manage all payment methods
DROP POLICY IF EXISTS "admin_insert_methods" ON payment_methods;
CREATE POLICY "admin_insert_methods"
ON payment_methods FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_methods" ON payment_methods;
CREATE POLICY "admin_update_methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_methods" ON payment_methods;
CREATE POLICY "admin_delete_methods"
ON payment_methods FOR DELETE
TO authenticated
USING (public.is_admin());

-- Seed default payment methods (disabled until CinetPay is configured)
INSERT INTO payment_methods (id, name, channel, display_order, is_enabled) VALUES
  ('wave', 'Wave', 'wave', 1, false),
  ('orange_money', 'Orange Money', 'omci', 2, false),
  ('mtn_momo', 'MTN MoMo', 'mtnci', 3, false),
  ('moov_money', 'Moov Money', 'moovci', 4, false),
  ('visa', 'Carte Visa', 'visa', 5, false),
  ('mastercard', 'Mastercard', 'mastercard', 6, false)
ON CONFLICT (id) DO NOTHING;

-- ─── Transactions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id text REFERENCES payment_methods(id),
  purpose text NOT NULL CHECK (purpose IN ('order', 'subscription', 'delivery_fee', 'promotion')),
  purpose_id uuid,
  amount_fcfa integer NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  provider_reference text,
  provider_response jsonb,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;

-- Owner can see their own transactions
DROP POLICY IF EXISTS "owner_read_own_tx" ON transactions;
CREATE POLICY "owner_read_own_tx"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Owner can create a pending transaction (cannot set succeeded themselves)
DROP POLICY IF EXISTS "owner_insert_own_tx" ON transactions;
CREATE POLICY "owner_insert_own_tx"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Owner can only cancel their own pending transactions
DROP POLICY IF EXISTS "owner_update_own_tx" ON transactions;
CREATE POLICY "owner_update_own_tx"
ON transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'cancelled'));

-- Admin can see all transactions
DROP POLICY IF EXISTS "admin_read_tx" ON transactions;
CREATE POLICY "admin_read_tx"
ON transactions FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can update transaction status (for refunds, manual review)
DROP POLICY IF EXISTS "admin_update_tx" ON transactions;
CREATE POLICY "admin_update_tx"
ON transactions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ─── Admin Credentials (server-side password hashes) ───────────────────
-- This table is NOT accessible via the Data API. RLS denies all direct access.
-- Only the admin-login edge function (using service_role) can read it.
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Deny all direct access from anon and authenticated users
DROP POLICY IF EXISTS "deny_all_admin_credentials" ON admin_credentials;
CREATE POLICY "deny_all_admin_credentials"
ON admin_credentials FOR SELECT
TO anon, authenticated
USING (false);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_approved ON shops(is_approved, is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant ON merchant_subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON merchant_subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_driver_apps_applicant ON driver_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_driver_apps_status ON driver_applications(application_status);

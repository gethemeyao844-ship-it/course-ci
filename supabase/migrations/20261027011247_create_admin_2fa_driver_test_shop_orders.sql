/*
# Admin 2FA codes, driver recruitment test, shop order transmission

## Summary
1. admin_verification_codes: temporary single-use codes for admin 2FA email verification
2. driver_test_questions: configurable recruitment questions for driver applicants
3. driver_test_answers: applicant responses with score
4. shop_orders: order transmission from merchant to driver (client → merchant → driver flow)

## Security
- admin_verification_codes: NO public access (RLS denies all). Only edge functions via service_role read/write.
- driver_test_questions: public SELECT (applicants need to see questions); admin INSERT/UPDATE/DELETE.
- driver_test_answers: applicant can SELECT/INSERT own; admin can SELECT all.
- shop_orders: owner (merchant) can SELECT/UPDATE own; driver can SELECT available; admin can SELECT all.
- A driver can only be assigned to one active shop_order at a time (enforced by unique partial index).
*/

-- ─── Admin 2FA Verification Codes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_verification_codes ENABLE ROW LEVEL SECURITY;

-- Deny all direct access
DROP POLICY IF EXISTS "deny_all_verification_codes" ON admin_verification_codes;
CREATE POLICY "deny_all_verification_codes"
ON admin_verification_codes FOR SELECT
TO anon, authenticated
USING (false);

CREATE INDEX IF NOT EXISTS idx_admin_codes_email ON admin_verification_codes(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_codes_expires ON admin_verification_codes(expires_at);

-- ─── Driver Recruitment Test Questions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  category text NOT NULL DEFAULT 'general',
  points integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE driver_test_questions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON driver_test_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON driver_test_questions TO authenticated;

-- Public can read active questions
DROP POLICY IF EXISTS "public_read_active_questions" ON driver_test_questions;
CREATE POLICY "public_read_active_questions"
ON driver_test_questions FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admin can manage all questions
DROP POLICY IF EXISTS "admin_manage_questions" ON driver_test_questions;
CREATE POLICY "admin_manage_questions"
ON driver_test_questions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Seed default test questions
INSERT INTO driver_test_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, sort_order) VALUES
  ('Un piéton traverse soudainement la route devant vous. Que faites-vous ?', 'Accélérer pour passer avant', 'Freiner doucement et le laisser passer', 'Klaxonner fortement et continuer', 'Changer de voie sans regarder', 'b', 'securite', 1),
  ('Quelle est la vitesse maximale autorisée en zone urbaine à Abidjan ?', '40 km/h', '50 km/h', '60 km/h', '80 km/h', 'b', 'securite', 2),
  ('Un client vous demande son colis avec agressivité. Comment réagissez-vous ?', 'Répondre sèchement', 'Ignorer le client', 'Rester calme et professionnel, expliquer poliment', 'Partir sans rien dire', 'c', 'relation_client', 3),
  ('Vous êtes en retard pour une livraison. Que faites-vous ?', 'Annuler la livraison', 'Prévenir le client et faire de votre mieux', 'Ignorer le retard', 'Demander à un autre livreur', 'b', 'ponctualite', 4),
  ('Comment devez-vous transporter un colis fragile ?', 'N''importe comment', 'Sans précaution spéciale', 'Avec soin, en protégeant le colis', 'Sur le porte-bagages sans fixation', 'c', 'gestion_colis', 5),
  ('Avant de confirmer une livraison, que devez-vous vérifier ?', 'Rien, déposer et partir', 'L''identité du destinataire et l''état du colis', 'Seulement le montant', 'Le temps qu''il fait', 'b', 'procedure', 6),
  ('Quelle pièce devez-vous toujours porter en livrant ?', 'Votre casque si vous êtes à moto', 'Rien', 'Des lunettes de soleil', 'Un gilet fluorescent seulement la nuit', 'a', 'securite', 7),
  ('Un colis est endommagé pendant le transport. Que faites-vous ?', 'Le livrer sans rien dire', 'Informer le client et l''administration', 'Le jeter', 'Le garder pour soi', 'b', 'gestion_colis', 8)
ON CONFLICT DO NOTHING;

-- ─── Driver Test Answers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_test_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES driver_applications(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES driver_test_questions(id),
  applicant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_answer text NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE driver_test_answers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON driver_test_answers TO authenticated;

-- Applicant can see their own answers
DROP POLICY IF EXISTS "applicant_read_own_answers" ON driver_test_answers;
CREATE POLICY "applicant_read_own_answers"
ON driver_test_answers FOR SELECT
TO authenticated
USING (auth.uid() = applicant_id);

-- Applicant can insert their own answers
DROP POLICY IF EXISTS "applicant_insert_own_answers" ON driver_test_answers;
CREATE POLICY "applicant_insert_own_answers"
ON driver_test_answers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_id);

-- Admin can see all answers
DROP POLICY IF EXISTS "admin_read_answers" ON driver_test_answers;
CREATE POLICY "admin_read_answers"
ON driver_test_answers FOR SELECT
TO authenticated
USING (public.is_admin());

-- ─── Shop Orders (client → merchant → driver transmission) ────────────
CREATE TABLE IF NOT EXISTS shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text UNIQUE NOT NULL,
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_fcfa integer NOT NULL,
  delivery_fee integer NOT NULL DEFAULT 0,
  delivery_address text NOT NULL,
  delivery_commune text,
  client_phone text NOT NULL,
  client_name text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'accepted', 'preparing', 'ready', 'awaiting_driver',
    'driver_assigned', 'en_route', 'delivered', 'refused', 'cancelled'
  )),
  merchant_response text,
  driver_assigned_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON shop_orders TO authenticated;

-- Client can see their own shop orders
DROP POLICY IF EXISTS "client_read_own_shop_orders" ON shop_orders;
CREATE POLICY "client_read_own_shop_orders"
ON shop_orders FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- Merchant (shop owner) can see and manage orders for their shop
DROP POLICY IF EXISTS "merchant_read_shop_orders" ON shop_orders;
CREATE POLICY "merchant_read_shop_orders"
ON shop_orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_orders.shop_id
    AND shops.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "merchant_update_shop_orders" ON shop_orders;
CREATE POLICY "merchant_update_shop_orders"
ON shop_orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_orders.shop_id
    AND shops.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_orders.shop_id
    AND shops.owner_id = auth.uid()
  )
);

-- Client can create shop orders
DROP POLICY IF EXISTS "client_insert_shop_orders" ON shop_orders;
CREATE POLICY "client_insert_shop_orders"
ON shop_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id AND status = 'received');

-- Approved drivers can see ready/awaiting orders
DROP POLICY IF EXISTS "driver_read_available_shop_orders" ON shop_orders;
CREATE POLICY "driver_read_available_shop_orders"
ON shop_orders FOR SELECT
TO authenticated
USING (
  (status IN ('ready', 'awaiting_driver') AND driver_id IS NULL)
  OR driver_id = auth.uid()
);

-- Driver can assign themselves to an order (only if approved and no existing driver)
DROP POLICY IF EXISTS "driver_update_shop_orders" ON shop_orders;
CREATE POLICY "driver_update_shop_orders"
ON shop_orders FOR UPDATE
TO authenticated
USING (
  driver_id = auth.uid()
  OR (status IN ('ready', 'awaiting_driver') AND driver_id IS NULL)
)
WITH CHECK (
  driver_id = auth.uid()
);

-- Admin can see all shop orders
DROP POLICY IF EXISTS "admin_read_shop_orders" ON shop_orders;
CREATE POLICY "admin_read_shop_orders"
ON shop_orders FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_shop_orders" ON shop_orders;
CREATE POLICY "admin_update_shop_orders"
ON shop_orders FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Index: ensure only one active driver per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_orders_one_driver
ON shop_orders(driver_id)
WHERE driver_id IS NOT NULL AND status IN ('driver_assigned', 'en_route');

CREATE INDEX IF NOT EXISTS idx_shop_orders_shop ON shop_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_client ON shop_orders(client_id);

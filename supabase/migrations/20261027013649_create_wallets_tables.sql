-- Wallets for all user types (client, merchant, driver)
-- Balances are NEVER modifiable from the browser — only via SECURITY DEFINER functions

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_role text NOT NULL CHECK (owner_role IN ('client', 'merchant', 'driver')),
  balance_fcfa integer NOT NULL DEFAULT 0 CHECK (balance_fcfa >= 0),
  pending_fcfa integer NOT NULL DEFAULT 0 CHECK (pending_fcfa >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON wallets TO authenticated;

-- Owner can only read their own wallet (no writes from browser)
CREATE POLICY "owner_read_own_wallet" ON wallets
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- Wallet transactions — audit trail for all financial movements
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  reference text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'payment', 'refund', 'earning', 'withdrawal', 'subscription', 'adjustment')),
  amount_fcfa integer NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description text,
  related_reference text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON wallet_transactions TO authenticated;

-- Owner can read their own wallet's transactions
CREATE POLICY "owner_read_own_transactions" ON wallet_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id
      AND wallets.owner_id = auth.uid()
    )
  );

-- Admin can read all wallets and transactions
CREATE POLICY "admin_read_all_wallets" ON wallets
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_read_all_transactions" ON wallet_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets w
      WHERE w.id = wallet_transactions.wallet_id
      AND public.is_admin()
    )
  );

-- Withdrawal requests from drivers/merchants
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_fcfa integer NOT NULL CHECK (amount_fcfa > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  payment_method text,
  payment_details text,
  admin_response text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON withdrawal_requests TO authenticated;

-- Owner can read and create their own withdrawal requests
CREATE POLICY "owner_read_own_withdrawals" ON withdrawal_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "owner_create_own_withdrawal" ON withdrawal_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Admin can read and update all withdrawal requests
CREATE POLICY "admin_read_all_withdrawals" ON withdrawal_requests
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_withdrawals" ON withdrawal_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_wallets_owner ON wallets(owner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_owner ON withdrawal_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status);

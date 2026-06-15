/*
# Create activity_logs, accounts_payable, receivables, uploads, products, and tasks tables

1. New Tables
  - `activity_logs` - Tracks changes to clients
  - `accounts_payable` - Company expenses
  - `receivables` - Expected income from clients
  - `uploads` - File uploads linked to clients/users
  - `products` - Digital products in ecosystem
  - `tasks` - Task management with assignment

2. Security
  - RLS enabled on all tables with appropriate ownership policies.
  - CEO can access all rows across all tables.
*/

-- ACTIVITY_LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  from_status text,
  to_status text,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_activity_logs" ON activity_logs;
CREATE POLICY "select_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "insert_activity_logs" ON activity_logs;
CREATE POLICY "insert_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "update_activity_logs" ON activity_logs;
CREATE POLICY "update_activity_logs" ON activity_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "delete_activity_logs" ON activity_logs;
CREATE POLICY "delete_activity_logs" ON activity_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

CREATE INDEX IF NOT EXISTS idx_activity_logs_client_id ON activity_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ACCOUNTS_PAYABLE TABLE
CREATE TABLE IF NOT EXISTS accounts_payable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  data_vencimento date NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  recorrencia text NOT NULL DEFAULT 'unica' CHECK (recorrencia IN ('mensal', 'unica')),
  categoria text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_accounts_payable" ON accounts_payable;
CREATE POLICY "select_accounts_payable" ON accounts_payable FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_accounts_payable" ON accounts_payable;
CREATE POLICY "insert_accounts_payable" ON accounts_payable FOR INSERT
  TO authenticated WITH CHECK (is_ceo());

DROP POLICY IF EXISTS "update_accounts_payable" ON accounts_payable;
CREATE POLICY "update_accounts_payable" ON accounts_payable FOR UPDATE
  TO authenticated USING (is_ceo()) WITH CHECK (is_ceo());

DROP POLICY IF EXISTS "delete_accounts_payable" ON accounts_payable;
CREATE POLICY "delete_accounts_payable" ON accounts_payable FOR DELETE
  TO authenticated USING (is_ceo());

-- RECEIVABLES TABLE
CREATE TABLE IF NOT EXISTS receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  descricao text,
  data_prevista date NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  periodicidade text NOT NULL DEFAULT 'unica' CHECK (periodicidade IN ('mensal', 'unica')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_receivables" ON receivables;
CREATE POLICY "select_receivables" ON receivables FOR SELECT
  TO authenticated USING (
    is_ceo() OR EXISTS (
      SELECT 1 FROM clients WHERE clients.id = receivables.client_id AND clients.responsavel_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_receivables" ON receivables;
CREATE POLICY "insert_receivables" ON receivables FOR INSERT
  TO authenticated WITH CHECK (
    is_ceo() OR EXISTS (
      SELECT 1 FROM clients WHERE clients.id = receivables.client_id AND clients.responsavel_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_receivables" ON receivables;
CREATE POLICY "update_receivables" ON receivables FOR UPDATE
  TO authenticated
  USING (
    is_ceo() OR EXISTS (
      SELECT 1 FROM clients WHERE clients.id = receivables.client_id AND clients.responsavel_id = auth.uid()
    )
  )
  WITH CHECK (
    is_ceo() OR EXISTS (
      SELECT 1 FROM clients WHERE clients.id = receivables.client_id AND clients.responsavel_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_receivables" ON receivables;
CREATE POLICY "delete_receivables" ON receivables FOR DELETE
  TO authenticated USING (
    is_ceo() OR EXISTS (
      SELECT 1 FROM clients WHERE clients.id = receivables.client_id AND clients.responsavel_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_receivables_client_id ON receivables(client_id);

-- UPLOADS TABLE
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_uploads" ON uploads;
CREATE POLICY "select_uploads" ON uploads FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "insert_uploads" ON uploads;
CREATE POLICY "insert_uploads" ON uploads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "update_uploads" ON uploads;
CREATE POLICY "update_uploads" ON uploads FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_ceo()) WITH CHECK (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "delete_uploads" ON uploads;
CREATE POLICY "delete_uploads" ON uploads FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  main_domain text,
  secondary_domain text,
  "function" text,
  notes text,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_products" ON products;
CREATE POLICY "insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "update_products" ON products;
CREATE POLICY "update_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_ceo()) WITH CHECK (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "delete_products" ON products;
CREATE POLICY "delete_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_tasks" ON tasks;
CREATE POLICY "select_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = assigned_to OR is_ceo());

DROP POLICY IF EXISTS "insert_tasks" ON tasks;
CREATE POLICY "insert_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR is_ceo());

DROP POLICY IF EXISTS "update_tasks" ON tasks;
CREATE POLICY "update_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = assigned_to OR is_ceo())
  WITH CHECK (auth.uid() = user_id OR auth.uid() = assigned_to OR is_ceo());

DROP POLICY IF EXISTS "delete_tasks" ON tasks;
CREATE POLICY "delete_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_ceo());

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

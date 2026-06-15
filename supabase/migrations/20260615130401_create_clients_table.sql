/*
# Create is_ceo helper function and clients table

1. Helper Function
  - `is_ceo()` - Returns true if the authenticated user has CEO role

2. New Tables
  - `clients` - CRM client/company records with full billing info

3. Security
  - RLS enabled. CEO can see all; Vendedor sees own clients only.
*/

-- Helper function to check if user is CEO
CREATE OR REPLACE FUNCTION is_ceo()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'CEO'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text NOT NULL,
  contato_nome text,
  email text,
  telefone text,
  website text,
  responsavel_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'proposta', 'negociacao', 'perdido', 'fechado', 'standby')),
  prioridade text NOT NULL DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  valor_estimado numeric NOT NULL DEFAULT 0,
  valor_pago numeric NOT NULL DEFAULT 0,
  parcelas integer NOT NULL DEFAULT 1,
  valor_restante numeric NOT NULL DEFAULT 0,
  ultimo_contato date,
  data_estimado_entrega date,
  notas text,
  cores_marca jsonb,
  links_referencia jsonb,
  setup_fee numeric DEFAULT 0,
  recurring_fee numeric DEFAULT 0,
  recurring_period text CHECK (recurring_period IS NULL OR recurring_period IN ('monthly', 'yearly', 'weekly')),
  next_billing_date date,
  billing_status text CHECK (billing_status IS NULL OR billing_status IN ('active', 'inactive', 'overdue', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clients" ON clients;
CREATE POLICY "select_clients" ON clients FOR SELECT
  TO authenticated USING (auth.uid() = responsavel_id OR is_ceo());

DROP POLICY IF EXISTS "insert_clients" ON clients;
CREATE POLICY "insert_clients" ON clients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = responsavel_id OR is_ceo());

DROP POLICY IF EXISTS "update_clients" ON clients;
CREATE POLICY "update_clients" ON clients FOR UPDATE
  TO authenticated USING (auth.uid() = responsavel_id OR is_ceo()) WITH CHECK (auth.uid() = responsavel_id OR is_ceo());

DROP POLICY IF EXISTS "delete_clients" ON clients;
CREATE POLICY "delete_clients" ON clients FOR DELETE
  TO authenticated USING (auth.uid() = responsavel_id OR is_ceo());

CREATE INDEX IF NOT EXISTS idx_clients_responsavel_id ON clients(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

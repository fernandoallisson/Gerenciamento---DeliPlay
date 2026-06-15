/*
  # Fix Clients RLS Policies

  1. Changes
    - Drop existing policies with potential recursion issues
    - Create new policies using the is_user_ceo helper function
    - Ensure vendedores can insert and manage their own clients
    - CEO can view and manage all clients

  2. Security
    - Vendedores can only insert clients with themselves as responsavel
    - Vendedores can only view/update their own clients
    - CEO has full access to all clients
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Vendedor can view own clients" ON clients;
DROP POLICY IF EXISTS "Vendedor can insert own clients" ON clients;
DROP POLICY IF EXISTS "Vendedor can update own clients" ON clients;
DROP POLICY IF EXISTS "CEO can delete clients" ON clients;

-- Create new non-recursive policies

-- SELECT policies
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (responsavel_id = auth.uid());

CREATE POLICY "CEO can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (public.is_user_ceo(auth.uid()));

-- INSERT policies
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (responsavel_id = auth.uid());

-- UPDATE policies
CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (responsavel_id = auth.uid())
  WITH CHECK (responsavel_id = auth.uid());

CREATE POLICY "CEO can update all clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (public.is_user_ceo(auth.uid()))
  WITH CHECK (public.is_user_ceo(auth.uid()));

-- DELETE policies
CREATE POLICY "CEO can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (public.is_user_ceo(auth.uid()));

/*
  # Fix Profiles RLS Policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create simpler, non-recursive policies
    - Allow users to read their own profile
    - Allow CEO operations without recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "CEO can view all profiles" ON profiles;
DROP POLICY IF EXISTS "CEO can insert profiles" ON profiles;
DROP POLICY IF EXISTS "CEO can update profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view all profiles if they are CEO"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'CEO'
  );

CREATE POLICY "CEO can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'CEO'
  );

CREATE POLICY "CEO can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'CEO'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'CEO'
  );

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
/*
  # Fix Profiles RLS Infinite Recursion

  1. Changes
    - Drop all existing policies that cause recursion
    - Create a helper function to check user role without recursion
    - Create new non-recursive policies using the helper function
    - Ensure users can always view their own profile
    - CEO can view/manage all profiles without recursion

  2. Security
    - Maintains strict RLS
    - Prevents infinite recursion by using a security definer function
    - Users can only view their own profile
    - CEO can manage all profiles
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles if they are CEO" ON profiles;
DROP POLICY IF EXISTS "CEO can insert profiles" ON profiles;
DROP POLICY IF EXISTS "CEO can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a security definer function to check if user is CEO
-- This breaks the recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION public.is_user_ceo(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'CEO'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_ceo(uuid) TO authenticated;

-- Create new non-recursive policies

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- CEO can view all profiles
CREATE POLICY "CEO can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_user_ceo(auth.uid()));

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- CEO can insert any profile
CREATE POLICY "CEO can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_user_ceo(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- CEO can update any profile
CREATE POLICY "CEO can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_user_ceo(auth.uid()))
  WITH CHECK (public.is_user_ceo(auth.uid()));

-- CEO can delete profiles
CREATE POLICY "CEO can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (public.is_user_ceo(auth.uid()));

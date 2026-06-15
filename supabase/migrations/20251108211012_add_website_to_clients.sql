/*
  # Add Website URL Field to Clients

  1. Changes
    - Add `website` column to `clients` table
      - Type: text (URL)
      - Nullable: true (not required)
      - Stores the client's website URL for easy access

  2. Purpose
    - Allow users to store and quickly access client websites
    - Enables direct navigation to client sites from the CRM
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'website'
  ) THEN
    ALTER TABLE clients ADD COLUMN website text;
  END IF;
END $$;
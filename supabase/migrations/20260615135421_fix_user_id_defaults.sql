-- Set default auth.uid() for user_id columns so inserts work without explicitly passing user_id
ALTER TABLE products ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE tasks ALTER COLUMN user_id SET DEFAULT auth.uid();

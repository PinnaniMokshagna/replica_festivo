/*
# Create User Profiles Table

## Summary
Adds a profiles table to store role (vendor | customer) and basic info
for each authenticated user.

## New Tables
- `profiles`
  - id (uuid, pk, references auth.users)
  - full_name (text)
  - role (text): 'customer' or 'vendor'
  - phone (text, nullable)
  - city (text, nullable)
  - avatar_url (text, nullable)
  - created_at (timestamp)

## Security
- RLS enabled
- Users can read/update only their own profile
- Insert allowed on signup (WITH CHECK auth.uid() = id)
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor')),
  phone text,
  city text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

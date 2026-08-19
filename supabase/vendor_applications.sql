-- ==========================================
-- VENDOR APPLICATIONS & KYC DOCUMENTS TABLE
-- Run this in Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  business_name text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Event Provider',
  location text NOT NULL DEFAULT 'Hyderabad, India',
  phone text DEFAULT '',
  govt_id_type text DEFAULT 'Aadhaar Card',
  govt_id_number text DEFAULT '',
  govt_id_file_url text DEFAULT '',
  bank_proof_file_url text DEFAULT '',
  business_reg_number text DEFAULT '',
  business_reg_file_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'kyc_submitted', 'approved', 'rejected')),
  kyc_submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vendor_applications" ON vendor_applications;
CREATE POLICY "public_read_vendor_applications" ON vendor_applications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_vendor_applications" ON vendor_applications;
CREATE POLICY "public_insert_vendor_applications" ON vendor_applications FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_vendor_applications" ON vendor_applications;
CREATE POLICY "public_update_vendor_applications" ON vendor_applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_vendor_applications" ON vendor_applications;
CREATE POLICY "public_delete_vendor_applications" ON vendor_applications FOR DELETE TO anon, authenticated USING (true);

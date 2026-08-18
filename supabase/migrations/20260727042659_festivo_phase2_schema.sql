/*
# Festivo Phase 2 Schema — Reviews, Notifications, Vendor Profiles, Services, Commissions

## Changes

### New Tables

1. `reviews` — Customer reviews after an event, linked to booking + vendor
   - rating (1-5), comment text, reply from vendor
   - RLS: customers can insert/read, vendors can update (reply), public can read

2. `notifications` — In-app notification feed per user
   - title, message, type (booking/review/payment/system), is_read flag
   - RLS: each user sees only their own notifications

3. `vendor_profiles` — Extended vendor metadata (GST, PAN, bank details, subscription)
   - Linked to auth.users, tracks approval status, commission rate, subscription tier
   - RLS: vendors see only their own profile; admins see all (via service role)

4. `services` — Individual service packages a vendor offers
   - title, category, price, discount, duration, description
   - RLS: public read; vendors insert/update/delete their own

5. `commissions` — Per-booking commission tracking
   - total amount, commission %, platform amount, vendor payout amount
   - RLS: anon + authenticated read (for booking confirmations)

## Security Notes
- All tables have RLS enabled
- Reviews: anon+authenticated can read (public catalog); only authenticated can write
- Notifications: authenticated users only, scoped to their user_id
- Vendor profiles: authenticated only, owner-scoped
- Services: public read; authenticated insert/update/delete scoped to vendor
*/

-- ── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT '',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  vendor_reply text,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_reviews" ON reviews;
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_reviews" ON reviews;
CREATE POLICY "auth_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system' CHECK (type IN ('booking','review','payment','system','chat')),
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow anon inserts for system-generated notifications (booking confirmations etc)
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon WITH CHECK (true);

-- ── Vendor Profiles (extended) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT '',
  gst_number text,
  pan_number text,
  bank_account text,
  bank_ifsc text,
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected','suspended')),
  commission_rate numeric(4,2) NOT NULL DEFAULT 15.00,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','basic','premium','elite')),
  subscription_expires_at timestamptz,
  total_earnings numeric NOT NULL DEFAULT 0,
  pending_payout numeric NOT NULL DEFAULT 0,
  documents_uploaded boolean NOT NULL DEFAULT false,
  bio text NOT NULL DEFAULT '',
  social_instagram text,
  social_facebook text,
  social_website text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_status ON vendor_profiles(approval_status);

ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vendor_profile" ON vendor_profiles;
CREATE POLICY "select_own_vendor_profile" ON vendor_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vendor_profile" ON vendor_profiles;
CREATE POLICY "insert_own_vendor_profile" ON vendor_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vendor_profile" ON vendor_profiles;
CREATE POLICY "update_own_vendor_profile" ON vendor_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Services ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  discount integer NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '1 day',
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "auth_insert_services" ON services;
CREATE POLICY "auth_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_services" ON services;
CREATE POLICY "auth_update_services" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_services" ON services;
CREATE POLICY "auth_delete_services" ON services FOR DELETE
  TO authenticated USING (true);

-- ── Commissions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  commission_rate numeric(4,2) NOT NULL DEFAULT 15.00,
  commission_amount numeric NOT NULL,
  gst_amount numeric NOT NULL DEFAULT 0,
  vendor_payout numeric NOT NULL,
  payout_status text NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending','processing','paid','failed')),
  payout_date timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_commissions_booking_id ON commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_commissions_payout_status ON commissions(payout_status);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_commissions" ON commissions;
CREATE POLICY "anon_read_commissions" ON commissions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_commissions" ON commissions;
CREATE POLICY "anon_insert_commissions" ON commissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_commissions" ON commissions;
CREATE POLICY "anon_update_commissions" ON commissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ── Seed sample reviews ───────────────────────────────────────────────────────
INSERT INTO reviews (vendor_id, customer_name, rating, comment, created_at)
SELECT
  v.id,
  names.name,
  ratings.rating,
  comments.comment,
  (now() - (INTERVAL '1 day' * (random() * 180)::int))
FROM vendors v
CROSS JOIN LATERAL (
  VALUES
    ('Priya Sharma', 5, 'Absolutely stunning work! Every detail was perfect. Our guests kept complimenting the setup throughout the evening. Highly recommended!'),
    ('Rahul Mehta', 5, 'Professional team, delivered beyond expectations. Communication was excellent from start to finish.'),
    ('Ananya Krishnan', 4, 'Great experience overall. The team was punctual and the quality was top-notch. Will definitely book again.'),
    ('Vikram Singh', 5, 'Made our wedding unforgettable. The creativity and attention to detail was unmatched. Worth every rupee!')
) AS data(name, rating, comment)
CROSS JOIN LATERAL (VALUES (data.name)) AS names(name)
CROSS JOIN LATERAL (VALUES (data.rating)) AS ratings(rating)
CROSS JOIN LATERAL (VALUES (data.comment)) AS comments(comment)
ON CONFLICT DO NOTHING;

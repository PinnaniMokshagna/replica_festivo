-- ==========================================
-- FESTIVO ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Copy and run this ENTIRE script in Supabase SQL Editor
-- ==========================================

-- 1. FESTIVO CORE SCHEMA & INITIAL SEED
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  price_amount numeric NOT NULL,
  price_label text NOT NULL DEFAULT 'per event',
  price_unit text NOT NULL DEFAULT '₹',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  reviews int NOT NULL DEFAULT 0,
  image text NOT NULL,
  gallery text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  badge text,
  badge_color text,
  capacity text,
  experience_years int,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  guests int NOT NULL DEFAULT 1,
  special_requests text,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  payment_intent_id text,
  booking_ref text UNIQUE NOT NULL DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vendors" ON vendors;
CREATE POLICY "anon_select_vendors" ON vendors FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO vendors (name, category, location, price_amount, price_label, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug) VALUES
(
  'The Grand Pavilion', 'Venue', 'Bandra, Mumbai', 120000, 'per event', 4.9, 324,
  'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['Air Conditioned', '500 Guests', 'Parking', 'Valet Service'],
  'The Grand Pavilion is Mumbai''s most iconic event venue offering world-class facilities for weddings, corporate events, and celebrations.',
  true, 'Top Rated', 'bg-sage-600', '50–500 guests', 12, 'the-grand-pavilion'
),
(
  'Spice Garden Catering', 'Catering', 'Koramangala, Bangalore', 850, 'per plate', 4.8, 512,
  'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'],
  ARRAY['Veg & Non-Veg', 'Live Counters', 'Home Style', 'International Cuisine'],
  'Spice Garden brings authentic flavors to your celebration. Master chefs crafting exquisite menus.',
  true, 'Trending', 'bg-cream-600', '50–2000 guests', 8, 'spice-garden-catering'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. USER PROFILES TABLE
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
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. PHASE 2 TABLES (REVIEWS, NOTIFICATIONS, VENDOR PROFILES, SERVICES, COMMISSIONS)
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
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_reviews" ON reviews;
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_reviews" ON reviews;
CREATE POLICY "auth_update_reviews" ON reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

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
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon WITH CHECK (true);

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
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vendor_profile" ON vendor_profiles;
CREATE POLICY "select_own_vendor_profile" ON vendor_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vendor_profile" ON vendor_profiles;
CREATE POLICY "insert_own_vendor_profile" ON vendor_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vendor_profile" ON vendor_profiles;
CREATE POLICY "update_own_vendor_profile" ON vendor_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "auth_insert_services" ON services;
CREATE POLICY "auth_insert_services" ON services FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_services" ON services;
CREATE POLICY "auth_update_services" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_services" ON services;
CREATE POLICY "auth_delete_services" ON services FOR DELETE TO authenticated USING (true);

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

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_commissions" ON commissions;
CREATE POLICY "anon_read_commissions" ON commissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_commissions" ON commissions;
CREATE POLICY "anon_insert_commissions" ON commissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_commissions" ON commissions;
CREATE POLICY "anon_update_commissions" ON commissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. VENDOR SERVICES, AVAILABILITY, CHAT & EXPANDED CATALOG SEED
CREATE TABLE IF NOT EXISTS vendor_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '',
  includes text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_vendor_services" ON vendor_services;
CREATE POLICY "public_read_vendor_services" ON vendor_services FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "auth_insert_vendor_services" ON vendor_services;
CREATE POLICY "auth_insert_vendor_services" ON vendor_services FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_vendor_services" ON vendor_services;
CREATE POLICY "auth_update_vendor_services" ON vendor_services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_vendor_services" ON vendor_services;
CREATE POLICY "auth_delete_vendor_services" ON vendor_services FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS vendor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, date)
);

ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_vendor_availability" ON vendor_availability;
CREATE POLICY "public_read_vendor_availability" ON vendor_availability FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_vendor_availability" ON vendor_availability;
CREATE POLICY "auth_insert_vendor_availability" ON vendor_availability FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_vendor_availability" ON vendor_availability;
CREATE POLICY "auth_update_vendor_availability" ON vendor_availability FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_vendor_availability" ON vendor_availability;
CREATE POLICY "auth_delete_vendor_availability" ON vendor_availability FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  customer_email text NOT NULL DEFAULT '',
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'vendor')),
  message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_chat_messages" ON chat_messages;
CREATE POLICY "anon_read_chat_messages" ON chat_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- SEED ALL VENDORS (14 CATEGORIES)
DO $$ BEGIN
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Lens & Light Studio', 'Photographer', 'Mumbai', 25000, 'per event', '₹', 4.9, 187, 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Pre-wedding','Candid','Drone'], 'Award-winning photography studio specializing in candid wedding moments.', true, 'Top Rated', 'bg-sage-600', null, 8, 'lens-and-light-studio'),
    ('Blossom Decorators', 'Decorator', 'Jaipur', 35000, 'per event', '₹', 4.8, 156, 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Stage','Floral','Theme'], 'Creating magical spaces with floral artistry and themed decor.', true, 'Premium', 'bg-gold-600', null, 10, 'blossom-decorators'),
    ('Royal Tent House', 'Tent House', 'Pune', 15000, 'per event', '₹', 4.5, 89, 'https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Tents','Pandal','Seating','Stage'], 'Complete tent and pandal solutions with seating and stage.', true, null, null, '500-2000 guests', 15, 'royal-tent-house'),
    ('Beat Drop DJ Services', 'DJ', 'Bangalore', 20000, 'per event', '₹', 4.9, 203, 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Sangeet','Corporate','Bollywood'], 'High-energy DJ with premium sound systems and LED lighting.', true, 'Top Rated', 'bg-sage-600', null, 7, 'beat-drop-dj-services'),
    ('Saffron Catering Co.', 'Catering', 'Mumbai', 350, 'per plate', '₹', 4.8, 245, 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Multi-cuisine','Live counter','Veg & Non-veg'], 'Premium catering with multi-cuisine menus and live counters.', true, 'Premium', 'bg-gold-600', null, 12, 'saffron-catering-co'),
    ('Bright Night Lighting', 'Lights', 'Hyderabad', 12000, 'per event', '₹', 4.6, 78, 'https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Ambient','Stage','LED','Fairy'], 'Professional lighting design and setup for weddings and events.', true, null, null, null, 6, 'bright-night-lighting'),
    ('Glam by Priya', 'Makeup', 'Delhi', 8000, 'per session', '₹', 4.9, 312, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Bridal','HD','Airbrush','Party'], 'Celebrity makeup artist specializing in bridal HD and airbrush makeup.', true, 'Top Rated', 'bg-sage-600', null, 9, 'glam-by-priya'),
    ('Grand Heritage Palace', 'Wedding Hall', 'Jaipur', 150000, 'per day', '₹', 4.9, 178, 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Heritage','AC','Garden','Parking'], 'A stunning heritage palace venue with lush gardens and grand halls.', true, 'Premium', 'bg-gold-600', '500-1500 guests', 20, 'grand-heritage-palace')
  ON CONFLICT (slug) DO NOTHING;
END $$;

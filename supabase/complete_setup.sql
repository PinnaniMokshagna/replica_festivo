-- ==============================================================================
-- FESTIVO ALL-IN-ONE SUPABASE SETUP SCRIPT (100% SUPABASE BACKEND)
-- Copy and run this entire script in your Supabase SQL Editor
-- ==============================================================================

-- 1. CORE VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL,
  location text NOT NULL DEFAULT 'India',
  price_amount numeric NOT NULL DEFAULT 5000,
  price_label text NOT NULL DEFAULT 'per event',
  price_unit text NOT NULL DEFAULT '₹',
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  reviews int NOT NULL DEFAULT 0,
  image text NOT NULL,
  gallery text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT true,
  badge text,
  badge_color text,
  capacity text,
  experience_years int DEFAULT 5,
  slug text UNIQUE NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_vendors" ON vendors;
CREATE POLICY "public_all_vendors" ON vendors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. VENDOR PACKAGES TABLE
CREATE TABLE IF NOT EXISTS vendor_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_email text,
  vendor_slug text,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Event Provider',
  package_type text DEFAULT 'Standard',
  price text NOT NULL DEFAULT '₹5,000',
  short_description text DEFAULT '',
  detailed_description text DEFAULT '',
  cover_image text,
  gallery_images text[] DEFAULT '{}',
  services text[] DEFAULT '{}',
  popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_packages_slug ON vendor_packages(vendor_slug);
CREATE INDEX IF NOT EXISTS idx_vendor_packages_email ON vendor_packages(vendor_email);
CREATE INDEX IF NOT EXISTS idx_vendor_packages_vendor_id ON vendor_packages(vendor_id);

ALTER TABLE vendor_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_vendor_packages" ON vendor_packages;
CREATE POLICY "public_all_vendor_packages" ON vendor_packages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  phone text,
  city text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_profiles" ON profiles;
CREATE POLICY "public_all_profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE RESTRICT,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  guests int NOT NULL DEFAULT 1,
  special_requests text,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  payment_intent_id text,
  booking_ref text UNIQUE NOT NULL DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  package_name text,
  package_price text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_bookings" ON bookings;
CREATE POLICY "public_all_bookings" ON bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. SAVED VENDORS (CUSTOMER FAVORITES)
CREATE TABLE IF NOT EXISTS saved_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_email, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_vendors_email ON saved_vendors(user_email);
ALTER TABLE saved_vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_saved_vendors" ON saved_vendors;
CREATE POLICY "public_all_saved_vendors" ON saved_vendors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_slug text,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT 'Customer',
  customer_email text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  vendor_reply text,
  helpful_count integer NOT NULL DEFAULT 0,
  date text DEFAULT to_char(now(), 'Mon DD, YYYY'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_slug ON reviews(vendor_slug);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_reviews" ON reviews;
CREATE POLICY "public_all_reviews" ON reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. VENDOR CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS vendor_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_email text NOT NULL,
  title text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text DEFAULT '',
  customer text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_vendor_email ON vendor_calendar_events(vendor_email);
ALTER TABLE vendor_calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_calendar_events" ON vendor_calendar_events;
CREATE POLICY "public_all_calendar_events" ON vendor_calendar_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. VENDOR PORTFOLIO PROJECTS
CREATE TABLE IF NOT EXISTS vendor_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_email text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  description text DEFAULT '',
  views integer DEFAULT 1,
  likes integer DEFAULT 0,
  date text DEFAULT to_char(now(), 'Mon YYYY'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_vendor_email ON vendor_portfolio(vendor_email);
ALTER TABLE vendor_portfolio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_portfolio" ON vendor_portfolio;
CREATE POLICY "public_all_portfolio" ON vendor_portfolio FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. VENDOR DEALS & PROMOTIONS
CREATE TABLE IF NOT EXISTS vendor_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_email text NOT NULL,
  code text NOT NULL,
  discount numeric NOT NULL DEFAULT 10,
  valid_till text NOT NULL,
  package_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_vendor_email ON vendor_deals(vendor_email);
ALTER TABLE vendor_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_deals" ON vendor_deals;
CREATE POLICY "public_all_deals" ON vendor_deals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 10. VENDOR KYC & DOCUMENT VERIFICATION
CREATE TABLE IF NOT EXISTS vendor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_email text NOT NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_docs_email ON vendor_documents(vendor_email);
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_vendor_docs" ON vendor_documents;
CREATE POLICY "public_all_vendor_docs" ON vendor_documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 11. VENDOR APPLICATIONS (FOR REGISTRATION & ADMIN WORKFLOW)
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
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_vendor_applications" ON vendor_applications;
CREATE POLICY "public_all_vendor_applications" ON vendor_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 12. CHAT & MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  vendor_name text DEFAULT '',
  vendor_email text DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  sender text NOT NULL DEFAULT 'user',
  text text NOT NULL DEFAULT '',
  time text DEFAULT to_char(now(), 'HH:MI AM'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_chat_messages" ON chat_messages;
CREATE POLICY "public_all_chat_messages" ON chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 13. SEED VENDORS
DO $$ BEGIN
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
  ),
  (
    'Lens & Light Studio', 'Photographer', 'Mumbai', 25000, 'per event', 4.9, 187,
    'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    ARRAY['https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
    ARRAY['Wedding','Pre-wedding','Candid','Drone'], 'Award-winning photography studio specializing in candid wedding moments.',
    true, 'Top Rated', 'bg-sage-600', null, 8, 'lens-and-light-studio'
  ),
  (
    'Blossom Decorators', 'Decorator', 'Jaipur', 35000, 'per event', 4.8, 156,
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    ARRAY['https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
    ARRAY['Wedding','Stage','Floral','Theme'], 'Creating magical spaces with floral artistry and themed decor.',
    true, 'Premium', 'bg-gold-600', null, 10, 'blossom-decorators'
  ),
  (
    'Beat Drop DJ Services', 'DJ', 'Bangalore', 20000, 'per event', 4.9, 203,
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    ARRAY['https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
    ARRAY['Wedding','Sangeet','Corporate','Bollywood'], 'High-energy DJ with premium sound systems and LED lighting.',
    true, 'Top Rated', 'bg-sage-600', null, 7, 'beat-drop-dj-services'
  )
  ON CONFLICT (slug) DO NOTHING;
END $$;

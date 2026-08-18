-- Vendor services, packages, availability, and chat tables
-- Also seeds vendors across all 14 categories

-- ── Vendor Services (packages offered by vendors) ──────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_vendor_services_vendor_id ON vendor_services(vendor_id);

ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vendor_services" ON vendor_services;
CREATE POLICY "public_read_vendor_services" ON vendor_services FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "auth_insert_vendor_services" ON vendor_services;
CREATE POLICY "auth_insert_vendor_services" ON vendor_services FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_vendor_services" ON vendor_services;
CREATE POLICY "auth_update_vendor_services" ON vendor_services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_vendor_services" ON vendor_services;
CREATE POLICY "auth_delete_vendor_services" ON vendor_services FOR DELETE
  TO authenticated USING (true);

-- ── Vendor Availability ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, date)
);

CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor_id ON vendor_availability(vendor_id);

ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vendor_availability" ON vendor_availability;
CREATE POLICY "public_read_vendor_availability" ON vendor_availability FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_vendor_availability" ON vendor_availability;
CREATE POLICY "auth_insert_vendor_availability" ON vendor_availability FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_vendor_availability" ON vendor_availability;
CREATE POLICY "auth_update_vendor_availability" ON vendor_availability FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_vendor_availability" ON vendor_availability;
CREATE POLICY "auth_delete_vendor_availability" ON vendor_availability FOR DELETE
  TO authenticated USING (true);

-- ── Chat Messages ────────────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_chat_messages_booking_id ON chat_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_vendor_id ON chat_messages(vendor_id);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_chat_messages" ON chat_messages;
CREATE POLICY "anon_read_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ── Seed vendors across all 14 categories ──────────────────────────────────
-- Using a DO block to insert vendors with varied data
DO $$ DECLARE
  r RECORD;
BEGIN
  -- Photographer
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Lens & Light Studio', 'Photographer', 'Mumbai', 25000, 'per event', '₹', 4.9, 187, 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Pre-wedding','Candid','Drone'], 'Award-winning photography studio specializing in candid wedding moments and cinematic pre-wedding shoots.', true, 'Top Rated', 'bg-sage-600', null, 8, 'lens-and-light-studio')
    ON CONFLICT (slug) DO NOTHING;

  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Frame Perfect Photography', 'Photographer', 'Delhi', 18000, 'per event', '₹', 4.7, 134, 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Portrait','Event'], 'Contemporary photography with a storytelling approach. We capture emotions, not just poses.', true, null, null, null, 5, 'frame-perfect-photography')
    ON CONFLICT (slug) DO NOTHING;

  -- Decorator
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Blossom Decorators', 'Decorator', 'Jaipur', 35000, 'per event', '₹', 4.8, 156, 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Stage','Floral','Theme'], 'Creating magical spaces with floral artistry, themed decor, and stunning stage setups for weddings and events.', true, 'Premium', 'bg-gold-600', null, 10, 'blossom-decorators')
    ON CONFLICT (slug) DO NOTHING;

  -- Tent House
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Royal Tent House', 'Tent House', 'Pune', 15000, 'per event', '₹', 4.5, 89, 'https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Tents','Pandal','Seating','Stage'], 'Complete tent and pandal solutions with seating, stage, and structural setups for any event size.', true, null, null, '500-2000 guests', 15, 'royal-tent-house')
    ON CONFLICT (slug) DO NOTHING;

  -- DJ
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Beat Drop DJ Services', 'DJ', 'Bangalore', 20000, 'per event', '₹', 4.9, 203, 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Sangeet','Corporate','Bollywood'], 'High-energy DJ with premium sound systems, LED lighting, and an extensive music library spanning every genre.', true, 'Top Rated', 'bg-sage-600', null, 7, 'beat-drop-dj-services')
    ON CONFLICT (slug) DO NOTHING;

  -- Catering
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Saffron Catering Co.', 'Catering', 'Mumbai', 350, 'per plate', '₹', 4.8, 245, 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Multi-cuisine','Live counter','Veg & Non-veg'], 'Premium catering with multi-cuisine menus, live counters, and professional service staff for weddings and corporate events.', true, 'Premium', 'bg-gold-600', null, 12, 'saffron-catering-co')
    ON CONFLICT (slug) DO NOTHING;

  -- Lights
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Bright Night Lighting', 'Lights', 'Hyderabad', 12000, 'per event', '₹', 4.6, 78, 'https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Ambient','Stage','LED','Fairy'], 'Professional lighting design and setup for weddings, events, and celebrations. We create the perfect ambiance.', true, null, null, null, 6, 'bright-night-lighting')
    ON CONFLICT (slug) DO NOTHING;

  -- Makeup
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Glam by Priya', 'Makeup', 'Delhi', 8000, 'per session', '₹', 4.9, 312, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Bridal','HD','Airbrush','Party'], 'Celebrity makeup artist specializing in bridal HD and airbrush makeup with saree draping and hairstyling.', true, 'Top Rated', 'bg-sage-600', null, 9, 'glam-by-priya')
    ON CONFLICT (slug) DO NOTHING;

  -- Travel
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Comfort Travels', 'Travel', 'Chennai', 5000, 'per trip', '₹', 4.4, 67, 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Luxury car','Guest transport','Airport'], 'Reliable transportation for weddings and events — luxury cars, guest buses, and airport transfers.', false, null, null, null, 8, 'comfort-travels')
    ON CONFLICT (slug) DO NOTHING;

  -- Wedding Hall
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Grand Heritage Palace', 'Wedding Hall', 'Jaipur', 150000, 'per day', '₹', 4.9, 178, 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1','https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Heritage','AC','Garden','Parking'], 'A stunning heritage palace venue with lush gardens, grand banquet halls, and royal architecture for unforgettable celebrations.', true, 'Premium', 'bg-gold-600', '500-1500 guests', 20, 'grand-heritage-palace')
    ON CONFLICT (slug) DO NOTHING;

  -- Pandit
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Pandit Sharma Ji', 'Pandit', 'Varanasi', 5100, 'per ceremony', '₹', 4.8, 145, 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Vedic','Muhurat','Havan'], 'Experienced Vedic priest conducting weddings, pujas, and ceremonies with authentic rituals and muhurat guidance.', true, null, null, null, 25, 'pandit-sharma-ji')
    ON CONFLICT (slug) DO NOTHING;

  -- Mehendi Artist
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Henna Art Studio', 'Mehendi Artist', 'Mumbai', 2500, 'per person', '₹', 4.7, 198, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Bridal','Arabic','Rajasthani','Organic'], 'Intricate mehendi designs using organic henna. Bridal, Arabic, and fusion styles with deep, long-lasting stains.', true, null, null, null, 6, 'henna-art-studio')
    ON CONFLICT (slug) DO NOTHING;

  -- Flower Decor
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('Petal & Bloom', 'Flower Decor', 'Bangalore', 28000, 'per event', '₹', 4.8, 112, 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Fresh flowers','Mandap','Centerpieces','Arches'], 'Fresh floral decoration for mandaps, stages, and centerpieces. We use premium flowers and create breathtaking arrangements.', true, null, null, null, 7, 'petal-and-bloom')
    ON CONFLICT (slug) DO NOTHING;

  -- Anchor
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('MC Arjun Live', 'Anchor', 'Hyderabad', 12000, 'per event', '₹', 4.7, 89, 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Wedding','Sangeet','Corporate','Bilingual'], 'Charismatic event anchor and MC with 5+ years hosting weddings, sangeets, and corporate events in Hindi and English.', true, null, null, null, 5, 'mc-arjun-live')
    ON CONFLICT (slug) DO NOTHING;

  -- Band
  INSERT INTO vendors (name, category, location, price_amount, price_label, price_unit, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug)
  VALUES
    ('The Sufi Nights Band', 'Band', 'Delhi', 35000, 'per performance', '₹', 4.8, 167, 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
     ARRAY['https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
     ARRAY['Bollywood','Sufi','Fusion','Live'], 'Live band performing Bollywood, Sufi, and fusion music. 6-piece band with professional sound setup.', true, 'Top Rated', 'bg-sage-600', null, 8, 'the-sufi-nights-band')
    ON CONFLICT (slug) DO NOTHING;

  -- Seed vendor services for the first few vendors
  INSERT INTO vendor_services (vendor_id, title, description, price, duration, includes)
  SELECT id, 'Premium Package', 'Full-day coverage with 2 photographers and drone', price_amount * 2, 'Full day', ARRAY['2 photographers','Drone shoot','500+ edited photos','Premium album','Same-day preview']
  FROM vendors WHERE slug = 'lens-and-light-studio'
  ON CONFLICT DO NOTHING;

  INSERT INTO vendor_services (vendor_id, title, description, price, duration, includes)
  SELECT id, 'Standard Package', '6-hour coverage with 1 photographer', price_amount, '6 hours', ARRAY['1 photographer','300+ edited photos','Digital gallery']
  FROM vendors WHERE slug = 'lens-and-light-studio'
  ON CONFLICT DO NOTHING;

  INSERT INTO vendor_services (vendor_id, title, description, price, duration, includes)
  SELECT id, 'Grand Wedding Setup', 'Full venue decoration with stage, entrance, and floral', price_amount, 'Full day', ARRAY['Stage decoration','Entrance setup','Floral arrangements','Centerpieces','Lighting']
  FROM vendors WHERE slug = 'blossom-decorators'
  ON CONFLICT DO NOTHING;

  INSERT INTO vendor_services (vendor_id, title, description, price, duration, includes)
  SELECT id, 'Bridal HD Makeup', 'Complete bridal makeup with HD technique, draping & hair', price_amount, '3-4 hours', ARRAY['HD makeup','Saree draping','Hairstyling','Touch-up kit','Trial session']
  FROM vendors WHERE slug = 'glam-by-priya'
  ON CONFLICT DO NOTHING;

  INSERT INTO vendor_services (vendor_id, title, description, price, duration, includes)
  SELECT id, 'Full Night DJ Set', '6-hour DJ performance with sound & lighting', price_amount, '6 hours', ARRAY['Professional DJ','Sound system','LED lighting','MC services','Song requests']
  FROM vendors WHERE slug = 'beat-drop-dj-services'
  ON CONFLICT DO NOTHING;
END $$;

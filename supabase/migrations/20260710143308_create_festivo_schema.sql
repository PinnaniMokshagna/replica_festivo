/*
# Festivo Platform Schema

## Summary
Creates the full schema for the Festivo event booking platform.

## New Tables

### vendors
- id (uuid, pk)
- name, category, location, price_amount, price_label, price_unit
- rating (numeric), reviews (int)
- image, gallery (text[])
- tags (text[]), description, verified (bool), badge, badge_color
- capacity, experience_years, slug (unique)

### bookings
- id (uuid, pk)
- vendor_id (fk vendors)
- customer_name, customer_email, customer_phone
- event_type, event_date, guests
- special_requests (text)
- total_amount (numeric)
- status: pending | confirmed | cancelled
- payment_status: unpaid | paid | refunded
- payment_intent_id (stripe)
- booking_ref (unique short code)
- created_at

## Security
- RLS enabled on both tables
- anon + authenticated can read vendors (public catalog)
- anon + authenticated can create bookings (no login required)
- Bookings readable by anon for confirmation lookup
*/

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);

-- RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Vendors: public read
DROP POLICY IF EXISTS "anon_select_vendors" ON vendors;
CREATE POLICY "anon_select_vendors" ON vendors FOR SELECT TO anon, authenticated USING (true);

-- Bookings: anyone can insert
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Bookings: readable for confirmation lookup
DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);

-- Bookings: update allowed (for payment status updates)
DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed vendors
INSERT INTO vendors (name, category, location, price_amount, price_label, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug) VALUES
(
  'The Grand Pavilion',
  'Venue',
  'Bandra, Mumbai',
  120000,
  'per event',
  4.9,
  324,
  'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Air Conditioned', '500 Guests', 'Parking', 'Valet Service'],
  'The Grand Pavilion is Mumbai''s most iconic event venue offering world-class facilities for weddings, corporate events, and celebrations. With stunning architecture, state-of-the-art AV systems, and impeccable service, we ensure every event is a masterpiece.',
  true,
  'Top Rated',
  'bg-amber-500',
  '50–500 guests',
  12,
  'the-grand-pavilion'
),
(
  'Spice Garden Catering',
  'Catering',
  'Koramangala, Bangalore',
  850,
  'per plate',
  4.8,
  512,
  'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Veg & Non-Veg', 'Live Counters', 'Home Style', 'International Cuisine'],
  'Spice Garden brings authentic flavors to your celebration. Our team of master chefs crafts exquisite menus tailored to your taste and cultural traditions. From traditional South Indian thalis to contemporary fusion, we deliver an unforgettable culinary experience.',
  true,
  'Trending',
  'bg-rose-500',
  '50–2000 guests',
  8,
  'spice-garden-catering'
),
(
  'Frame & Focus Studio',
  'Photography',
  'Hauz Khas, Delhi',
  45000,
  'per day',
  4.9,
  289,
  'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Candid Photography', 'Cinematic Video', 'Drone Shots', '4K Editing'],
  'Frame & Focus Studio specializes in capturing your most precious moments with artistic brilliance. Our award-winning photographers blend candid emotion with cinematic storytelling. From drone aerials to intimate close-ups, every frame is crafted to perfection.',
  true,
  'Premium',
  'bg-dark-800',
  'Any event size',
  10,
  'frame-focus-studio'
),
(
  'Blossom Decor Studio',
  'Decoration',
  'Anna Nagar, Chennai',
  35000,
  'onwards',
  4.7,
  403,
  'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Floral Themes', 'LED Setup', 'Custom Designs', 'Theme Decor'],
  'Blossom Decor Studio transforms venues into breathtaking spaces. Our creative team blends floral artistry with modern lighting to create immersive experiences. We specialize in customized themes that reflect your personality and vision.',
  true,
  'Popular',
  'bg-pink-500',
  'Any venue size',
  7,
  'blossom-decor-studio'
),
(
  'Rhythm & Beats DJ',
  'Entertainment',
  'Juhu, Mumbai',
  25000,
  'per event',
  4.8,
  178,
  'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1540319/pexels-photo-1540319.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Bollywood Hits', 'International Sets', 'Live Band', 'MC Services'],
  'Rhythm & Beats brings the party to life! Our professional DJs read the crowd and curate seamless sets spanning Bollywood, International, and Regional music. With premium sound systems and light rigs, we guarantee the dance floor stays packed all night.',
  false,
  'New',
  'bg-emerald-500',
  'Up to 1000 guests',
  4,
  'rhythm-beats-dj'
),
(
  'Event Canvas Pro',
  'Coordinator',
  'Powai, Mumbai',
  60000,
  'per event',
  5.0,
  95,
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Full Planning', 'On-site Management', 'Budget Tracking', 'Vendor Coordination'],
  'Event Canvas Pro is your complete event management partner. From concept to execution, our experienced coordinators handle every detail with precision and passion. We have successfully delivered 500+ events across India, earning a perfect 5-star reputation.',
  true,
  'Top Rated',
  'bg-amber-500',
  'Any event size',
  15,
  'event-canvas-pro'
),
(
  'Royal Heritage Palace',
  'Venue',
  'Jaipur, Rajasthan',
  250000,
  'per event',
  4.9,
  156,
  'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Heritage Property', 'Royal Ambience', 'Garden Lawns', 'Luxury Suites'],
  'Experience the grandeur of Rajasthan royalty at Royal Heritage Palace. This stunning 18th-century palace offers majestic halls, lush gardens, and regal suites for destination weddings and elite events. Every celebration here becomes a timeless saga.',
  true,
  'Luxury',
  'bg-gold-600',
  '100–800 guests',
  20,
  'royal-heritage-palace'
),
(
  'Lens & Light Photography',
  'Photography',
  'Bandra, Mumbai',
  55000,
  'per day',
  4.8,
  341,
  'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Pre-Wedding Shoots', 'Documentary Style', 'Same Day Edit', 'Album Design'],
  'Lens & Light Photography is synonymous with breathtaking imagery. Our team of photojournalists captures the raw emotion and authentic moments of your event. We offer pre-wedding shoots, event coverage, and cinematic films that tell your unique story.',
  true,
  'Featured',
  'bg-sky-500',
  'Any event size',
  9,
  'lens-light-photography'
)
ON CONFLICT (slug) DO NOTHING;

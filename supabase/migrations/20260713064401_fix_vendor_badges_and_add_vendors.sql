-- Update badge colors to match new sage/cream/gold palette
UPDATE vendors SET badge_color = 'bg-sage-600' WHERE badge_color = 'bg-amber-500';
UPDATE vendors SET badge_color = 'bg-cream-600' WHERE badge_color = 'bg-rose-500';
UPDATE vendors SET badge_color = 'bg-cream-600' WHERE badge_color = 'bg-pink-500';
UPDATE vendors SET badge_color = 'bg-sage-500' WHERE badge_color = 'bg-emerald-500';
UPDATE vendors SET badge_color = 'bg-sage-700' WHERE badge_color = 'bg-sky-500';
UPDATE vendors SET badge_color = 'bg-gold-600' WHERE badge_color = 'bg-gold-600';

-- Add more vendors for a richer experience
INSERT INTO vendors (name, category, location, price_amount, price_label, rating, reviews, image, gallery, tags, description, verified, badge, badge_color, capacity, experience_years, slug) VALUES
(
  'Saffron & Sage Caterers',
  'Catering',
  'Banjara Hills, Hyderabad',
  1200,
  'per plate',
  4.7,
  267,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Hyderabadi Special', 'Live Biryani Counter', 'Dessert Studio', 'Multi-Cuisine'],
  'Saffron & Sage Caterers brings the authentic flavors of Hyderabad to your celebration. Famous for our Dum Biryani and royal Hyderabadi feast, we create culinary experiences that guests remember for years. Our live counters and dessert studios add a touch of theatre to every event.',
  true,
  'Featured',
  'bg-sage-600',
  '50–1500 guests',
  11,
  'saffron-sage-caterers'
),
(
  'Velvet Bloom Decor',
  'Decoration',
  'Indiranagar, Bangalore',
  45000,
  'onwards',
  4.8,
  198,
  'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Boho Themes', 'Floral Arches', 'Mood Lighting', 'Sustainable Decor'],
  'Velvet Bloom Decor creates Instagram-worthy setups that blend bohemian charm with elegant sophistication. From floral arches to sustainable decor, we design immersive environments that tell your story. Every element is carefully curated to create a cohesive visual narrative.',
  true,
  'Trending',
  'bg-cream-600',
  'Any venue size',
  6,
  'velvet-bloom-decor'
),
(
  'The Skyline Terrace',
  'Venue',
  'Worli, Mumbai',
  180000,
  'per event',
  4.8,
  142,
  'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Rooftop Venue', 'Sea View', 'Infinity Pool', 'Sky Bar'],
  'The Skyline Terrace offers a breathtaking rooftop experience with panoramic views of the Mumbai skyline and Arabian Sea. Perfect for cocktail receptions, engagement parties, and corporate gatherings. Our infinity pool and sky bar add an extra layer of luxury to your celebration.',
  true,
  'Premium',
  'bg-sage-700',
  '50–300 guests',
  5,
  'skyline-terrace'
),
(
  'Echoes Live Music',
  'Entertainment',
  'Hauz Khas, Delhi',
  35000,
  'per event',
  4.6,
  89,
  'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1540319/pexels-photo-1540319.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Live Band', 'Sufi Nights', 'Jazz Ensemble', 'Acoustic Sets'],
  'Echoes Live Music brings soulful performances to your events. From energetic Bollywood bands to serene Sufi nights and smooth jazz ensembles, our musicians create the perfect ambience. Every performance is tailored to your event mood and audience.',
  false,
  'New',
  'bg-sage-500',
  'Up to 500 guests',
  3,
  'echoes-live-music'
),
(
  'Perfect Moments Planner',
  'Coordinator',
  'Jubilee Hills, Hyderabad',
  75000,
  'per event',
  4.9,
  176,
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Luxury Weddings', 'Destination Events', 'Theme Concepts', 'Guest Management'],
  'Perfect Moments Planner specializes in luxury weddings and destination events. With a team of 30+ professionals, we have executed over 200 landmark celebrations across India and abroad. Our attention to detail and creative concepts make every event uniquely memorable.',
  true,
  'Top Rated',
  'bg-sage-600',
  'Any event size',
  12,
  'perfect-moments-planner'
),
(
  'Candid Tales Studio',
  'Photography',
  'Anna Nagar, Chennai',
  38000,
  'per day',
  4.7,
  312,
  'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Candid Style', 'Pre-Wedding Films', 'Drone Coverage', 'Same Day Edit'],
  'Candid Tales Studio captures the unscripted, raw emotions of your celebration. Our photojournalistic approach ensures every genuine smile, tear, and laugh is preserved. We specialize in pre-wedding films and same-day edits that let you relive your special day instantly.',
  true,
  'Popular',
  'bg-cream-600',
  'Any event size',
  8,
  'candid-tales-studio'
)
ON CONFLICT (slug) DO NOTHING;

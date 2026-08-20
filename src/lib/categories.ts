import {
  Camera, Utensils, Flower2, Building2, Music, Zap,
  Lightbulb, Sparkles, Car, Heart, Handshake, Palette,
  Mic, PartyPopper, Tent, type LucideIcon
} from 'lucide-react';

export type CategoryDef = {
  label: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  description: string;
  longDescription: string;
  whatTheyDo: string[];
  startingPrice: string;
  image: string;
};

export const CATEGORIES: CategoryDef[] = [
  {
    label: 'Photographer',
    icon: Camera,
    color: 'sage',
    gradient: 'from-sage-500 to-sage-700',
    description: 'Capture every smile, tear, and dance move with award-winning photographers.',
    longDescription: 'Professional photographers who specialize in weddings, events, portraits, and candid moments. They bring high-end equipment, creative direction, and years of experience to ensure your memories are preserved beautifully.',
    whatTheyDo: [
      'Candid and traditional wedding photography',
      'Pre-wedding and engagement shoots',
      'Event coverage with multiple photographers',
      'Drone aerial photography',
      'Same-day edited preview photos',
      'Premium photo albums and prints',
    ],
    startingPrice: '₹15,000',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Decorator',
    icon: Flower2,
    color: 'cream',
    gradient: 'from-cream-500 to-cream-700',
    description: 'Transform any venue into a breathtaking celebration space.',
    longDescription: 'Decorators bring your vision to life with floral arrangements, stage setups, lighting design, themed decor, and table settings. From intimate gatherings to grand weddings, they handle every visual detail.',
    whatTheyDo: [
      'Stage and mandap decoration',
      'Floral arrangements and centerpieces',
      'Theme-based event decor',
      'Lighting and ambiance design',
      'Entrance and walkway setups',
      'Table setting and chair covers',
    ],
    startingPrice: '₹10,000',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Tent House',
    icon: Tent,
    color: 'sage',
    gradient: 'from-sage-600 to-sage-800',
    description: 'Tents, canopies, and structural setups for outdoor and indoor events.',
    longDescription: 'Tent house providers supply tents, marquees, pandals, seating arrangements, and structural setups. Essential for outdoor weddings, community events, and large gatherings that need weather protection and organized spaces.',
    whatTheyDo: [
      'Tent and marquee setup',
      'Pandal and canopy structures',
      'Seating arrangement (chairs, tables, sofas)',
      'Stage platform construction',
      'Carpet and flooring installation',
      'Dismantling after the event',
    ],
    startingPrice: '₹8,000',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'DJ',
    icon: Music,
    color: 'sage',
    gradient: 'from-sage-500 to-sage-700',
    description: 'Keep the party alive with professional DJs and sound systems.',
    longDescription: 'DJs bring the energy with curated playlists, professional sound systems, lighting effects, and crowd engagement. They read the room and keep guests dancing all night long.',
    whatTheyDo: [
      'Live DJ performance with curated playlists',
      'Professional sound system setup',
      'LED and laser lighting effects',
      'MC services and crowd engagement',
      'Bollywood, regional, and international music',
      'Karaoke and special request handling',
    ],
    startingPrice: '₹12,000',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Catering',
    icon: Utensils,
    color: 'cream',
    gradient: 'from-cream-500 to-cream-700',
    description: 'Gourmet menus for every taste — from traditional feasts to fusion cuisine.',
    longDescription: 'Catering services provide complete food and beverage solutions including menu planning, live counters, multi-cuisine options, serving staff, and presentation. They handle everything from appetizers to desserts.',
    whatTheyDo: [
      'Multi-cuisine menu planning (veg & non-veg)',
      'Live cooking stations and food counters',
      'Traditional banana leaf or buffet setups',
      'Professional serving and wait staff',
      'Beverages, mocktails, and dessert counters',
      'Custom dietary requirement handling',
    ],
    startingPrice: '₹350/plate',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Lights',
    icon: Lightbulb,
    color: 'sage',
    gradient: 'from-sage-600 to-sage-800',
    description: 'Ambient, architectural, and party lighting to set the perfect mood.',
    longDescription: 'Lighting experts design ambient, decorative, and stage lighting to illuminate your venue. From fairy lights and chandeliers to intelligent moving heads and projection mapping.',
    whatTheyDo: [
      'Ambient and fairy light decoration',
      'Stage and truss lighting setup',
      'Architectural venue illumination',
      'Intelligent moving heads and laser lights',
      'Cold pyro and fog machine effects',
      'Generator and power backup management',
    ],
    startingPrice: '₹5,000',
    image: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Makeup',
    icon: Sparkles,
    color: 'cream',
    gradient: 'from-cream-500 to-cream-700',
    description: 'Bridal, party, and HD makeup artists to make you look radiant.',
    longDescription: 'Professional makeup artists specialize in bridal looks, HD makeup, airbrush makeup, and hairstyling. They work with top international products to give you a flawless, long-lasting look for your special day.',
    whatTheyDo: [
      'Bridal HD and Airbrush makeup',
      'Pre-wedding and engagement makeup',
      'Party makeup for family and guests',
      'Hairstyling and saree/dupatta draping',
      'Nail art and lash extensions',
      'On-location makeup services',
    ],
    startingPrice: '₹8,000',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Travel',
    icon: Car,
    color: 'sage',
    gradient: 'from-sage-500 to-sage-700',
    description: 'Luxury cars, vintage vehicles, and guest transport solutions.',
    longDescription: 'Travel providers offer luxury cars for bride/groom entry, vintage cars for processions, and buses/coaches for guest transportation. Reliable drivers and well-maintained vehicles for seamless event logistics.',
    whatTheyDo: [
      'Luxury sedan and SUV rentals',
      'Vintage car rentals for wedding entry',
      'Buses and coaches for guest transport',
      'Airport pick-up and drop services',
      'Decorated wedding car rental',
      'Chauffeur-driven vehicles with local knowledge',
    ],
    startingPrice: '₹3,000',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Wedding Hall',
    icon: Building2,
    color: 'sage',
    gradient: 'from-sage-500 to-sage-700',
    description: 'Stunning venues from heritage palaces to modern banquet halls.',
    longDescription: 'Wedding halls and venues provide the perfect backdrop for your celebration. Options range from intimate spaces to grand banquet halls, outdoor gardens, heritage properties, and destination venues.',
    whatTheyDo: [
      'Banquet hall and lawn rentals',
      'Heritage palace and destination venues',
      'In-house catering and decoration options',
      'Parking and valet services',
      'Bridal rooms and guest lounges',
      'AC/non-AC options with capacity flexibility',
    ],
    startingPrice: '₹50,000',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Pandit',
    icon: Handshake,
    color: 'gold',
    gradient: 'from-gold-500 to-gold-700',
    description: 'Experienced priests to conduct ceremonies with authenticity.',
    longDescription: 'Pandits and priests conduct weddings, pujas, and religious ceremonies with proper Vedic rituals. They guide families through every step, ensuring traditions are honored and ceremonies are meaningful.',
    whatTheyDo: [
      'Wedding ceremony (Vedic rituals)',
      'Engagement and sagai ceremonies',
      'Griha pravesh and housewarming pujas',
      'Satyanarayan katha and havan',
      'Muhurat guidance and astrology',
      'Regional and community-specific rituals',
    ],
    startingPrice: '₹5,100',
    image: 'https://static.vecteezy.com/system/resources/thumbnails/031/610/653/small_2x/a-picture-of-a-young-indian-man-saying-hello-with-his-hands-together-ai-generative-photo.jpg',
  },
  {
    label: 'Mehendi Artist',
    icon: Palette,
    color: 'cream',
    gradient: 'from-cream-500 to-cream-700',
    description: 'Intricate henna designs for brides and guests alike.',
    longDescription: 'Mehendi artists create stunning henna designs ranging from traditional Indian patterns to contemporary Arabic and fusion styles. They use organic henna and ensure long-lasting, deep stains.',
    whatTheyDo: [
      'Bridal mehendi (full hand and arm)',
      'Guest mehendi stations at events',
      'Arabic, Rajasthani, and fusion designs',
      'Organic henna with essential oils',
      'Glitter and colored henna options',
      'Mehendi cones for DIY application',
    ],
    startingPrice: '₹1,500',
    image: 'https://i.pinimg.com/736x/0b/1f/9b/0b1f9b6c0bfd082c87f8e0dae17554b2.jpg',
  },
  {
    label: 'Flower Decor',
    icon: Flower2,
    color: 'sage',
    gradient: 'from-sage-600 to-sage-800',
    description: 'Fresh floral arrangements that add elegance to every occasion.',
    longDescription: 'Flower decor specialists create stunning arrangements using fresh flowers — from marigold and rose to exotic imports. They handle mandap flowers, table centerpieces, garlands, and floral arches.',
    whatTheyDo: [
      'Mandap and stage flower decoration',
      'Bridal and groom floral accessories',
      'Table centerpieces and bouquets',
      'Floral arches and entrance decor',
      'Flower walls and backdrops',
      'Garlands and boutonnieres',
    ],
    startingPrice: '₹12,000',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Anchor',
    icon: Mic,
    color: 'gold',
    gradient: 'from-gold-500 to-gold-700',
    description: 'Charismatic hosts who keep your event flowing with energy.',
    longDescription: 'Anchors and emcees host your event with charm, humor, and professionalism. They manage the timeline, engage the audience, introduce speakers, and ensure the celebration runs smoothly from start to finish.',
    whatTheyDo: [
      'Wedding and sangeet hosting',
      'Corporate event MC services',
      'Audience games and interactive activities',
      'Bilingual and multilingual hosting',
      'Script writing and event flow planning',
      'Coordination with DJs and performers',
    ],
    startingPrice: '₹8,000',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Band',
    icon: PartyPopper,
    color: 'sage',
    gradient: 'from-sage-500 to-sage-700',
    description: 'Live bands and musicians to make your celebration unforgettable.',
    longDescription: 'Live bands perform Bollywood hits, regional favorites, Sufi, jazz, and fusion music. They bring energy and entertainment that recorded music simply cannot match, creating memorable moments for guests.',
    whatTheyDo: [
      'Live band performance (4-8 musicians)',
      'Bollywood and regional music sets',
      'Sufi and classical fusion performances',
      'Instrumental and acoustic sets',
      'Custom song requests and dedications',
      'Sound and instrument setup',
    ],
    startingPrice: '₹20,000',
    image: 'https://jodilogik.com/wp-content/uploads/2016/02/Raipur-Wedding-Band.jpg',
  },
];

export const CATEGORY_LABELS = CATEGORIES.map(c => c.label);

export const ALL_CATEGORIES = Array.from(new Set([
  ...CATEGORY_LABELS,
  'Wedding Planner',
  'Videographer',
  'Venue',
  'Event Rental',
  'Invitation Designer',
  'Entertainment',
  'Event Provider',
]));

export function getCategory(label: string): CategoryDef | undefined {
  if (!label) return undefined;
  const target = label.toLowerCase().trim();

  // 1. Exact case-insensitive match
  const exactMatch = CATEGORIES.find(c => c.label.toLowerCase() === target);
  if (exactMatch) return exactMatch;

  // 2. Synonyms & aliases
  if (target.includes('photo') || target.includes('camera') || target.includes('videog')) {
    return CATEGORIES.find(c => c.label === 'Photographer');
  }
  if (target.includes('decor')) {
    return CATEGORIES.find(c => c.label === 'Decorator');
  }
  if (target.includes('cater')) {
    return CATEGORIES.find(c => c.label === 'Catering');
  }
  if (target.includes('venue') || target.includes('hall') || target.includes('banquet')) {
    return CATEGORIES.find(c => c.label === 'Wedding Hall');
  }
  if (target.includes('makeup') || target.includes('beauty')) {
    return CATEGORIES.find(c => c.label === 'Makeup');
  }
  if (target.includes('dj') || target.includes('music') || target.includes('sound')) {
    return CATEGORIES.find(c => c.label === 'DJ');
  }

  // 3. Substring match fallback
  return CATEGORIES.find(
    c => c.label.toLowerCase().includes(target) || target.includes(c.label.toLowerCase())
  );
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key-123456789';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Avoids URL hash parsing on every load
  },
  global: {
    headers: { 'x-application-name': 'eventmaster-web' },
  },
});

export type Vendor = {
  id: string;
  name: string;
  category: string;
  location: string;
  price_amount: number;
  price_label: string;
  price_unit: string;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  tags: string[];
  description: string;
  verified: boolean;
  badge: string | null;
  badge_color: string | null;
  capacity: string | null;
  experience_years: number | null;
  slug: string;
  created_at: string;
};

export type Booking = {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: string;
  event_date: string;
  guests: number;
  special_requests: string | null;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_intent_id: string | null;
  booking_ref: string;
  created_at: string;
};

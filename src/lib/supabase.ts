import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ymtczcqzrzhbmhoeayvs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Hn8WeEL0Ms0KpQ_19JGgOw_81rdLiaI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'x-application-name': 'festivo-web' },
  },
});

export type Vendor = {
  id: string;
  user_id?: string;
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
  email?: string;
  phone?: string;
  custom_packages?: VendorPackage[];
  created_at?: string;
};

export type VendorPackage = {
  id?: string;
  vendor_id?: string;
  vendor_email?: string;
  vendor_slug?: string;
  name: string;
  category: string;
  package_type?: string;
  price: string;
  short_description?: string;
  detailed_description?: string;
  cover_image?: string;
  gallery_images?: string[];
  services?: string[];
  popular?: boolean;
  created_at?: string;
};

export type Booking = {
  id: string;
  vendor_id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: string;
  event_date: string;
  guests: number;
  special_requests: string | null;
  rejection_reason?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_vendor_approval' | 'vendor_accepted' | 'rejected';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_intent_id: string | null;
  booking_ref: string;
  package_name?: string;
  package_price?: string;
  created_at: string;
  vendor?: Vendor;
};

export type SavedVendor = {
  id: string;
  user_id?: string;
  user_email: string;
  vendor_id: string;
  created_at?: string;
};

export type Review = {
  id: string;
  booking_id?: string;
  vendor_id: string;
  vendor_slug?: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment: string;
  vendor_reply?: string;
  helpful_count?: number;
  date?: string;
  created_at?: string;
};

export type VendorCalendarEvent = {
  id: string;
  vendor_id?: string;
  vendor_email: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  customer?: string;
  created_at?: string;
};

export type VendorPortfolioItem = {
  id: string;
  vendor_id?: string;
  vendor_email: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
  views?: number;
  likes?: number;
  date?: string;
  created_at?: string;
};

export type VendorDeal = {
  id: string;
  vendor_id?: string;
  vendor_email: string;
  code: string;
  discount: number;
  valid_till: string;
  package_name: string;
  status: 'active' | 'expired';
  created_at?: string;
};

export type VendorDocument = {
  id: string;
  vendor_email: string;
  vendor_id?: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: string;
  status: 'pending' | 'verified' | 'rejected';
  remarks?: string;
  created_at?: string;
  updated_at?: string;
};

export type ChatMessage = {
  id: string;
  booking_id?: string;
  vendor_name?: string;
  vendor_email?: string;
  customer_email: string;
  sender: 'user' | 'vendor';
  text: string;
  time?: string;
  created_at?: string;
};

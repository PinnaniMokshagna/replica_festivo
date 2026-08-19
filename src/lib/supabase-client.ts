import { createClient } from '@supabase/supabase-js';

// Fallback configuration if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vbsrhcuexsawjqqyrnii.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_o9sN9sximLLzAEnpHOaKNQ_ANC50ayh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co'
  );
};

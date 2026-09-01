import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder-project') &&
  !supabaseUrl.includes('your-project-id')
);

export const createClient = () => {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase SSR client, falling back to standard client', error);
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
};

export const supabase = isSupabaseConfigured ? createClient() : null;

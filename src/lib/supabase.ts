import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-project-url');
};

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (client) return client;
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  }
  client = createClient(supabaseUrl!, supabaseAnonKey!);
  return client;
}

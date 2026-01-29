import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwceqvxotkstkiwevdox.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDI3MDQsImV4cCI6MjA4NDc3ODcwNH0.9VM8_6rpX6z5VGDVvzIPkgBpjkNunIPxyQDzmHQwKBA';

/**
 * SOVEREIGN AUTH SINGLETON [V11.0 - SECURE]
 * The admin client has been removed from the client-side bundle.
 * All administrative operations must be handled via secure server-side API routes.
 */
const getSupabaseClient = () => {
  const global = globalThis as any;
  if (!global._supabaseInstance) {
    global._supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sovereign-auth-token'
      }
    });
  }
  return global._supabaseInstance;
};

export const supabase = getSupabaseClient();
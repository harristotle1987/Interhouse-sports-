import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwceqvxotkstkiwevdox.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDI3MDQsImV4cCI6MjA4NDc3ODcwNH0.9VM8_6rpX6z5VGDVvzIPkgBpjkNunIPxyQDzmHQwKBA';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwMjcwNCwiZXhwIjoyMDg0Nzc4NzA0fQ.VZxfLWXwj49jstz15Td68YGpLDjk9bi-2an6NgzbSec';

/**
 * SOVEREIGN AUTH SINGLETON [V10.4 - HARDENED]
 * Ensures exactly one GoTrueClient instance exists in the memory context to prevent 
 * "Multiple GoTrueClient instances detected" errors and race conditions.
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

const getSupabaseAdminClient = () => {
  const global = globalThis as any;
  if (!global._supabaseAdminInstance) {
    global._supabaseAdminInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return global._supabaseAdminInstance;
};

export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

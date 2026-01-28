import { createClient } from '@supabase/supabase-js';

/**
 * SOVEREIGN IDENTITY CORE: SINGLETON ARCHITECTURE [V13.0]
 * Prevents multiple GoTrueClient instances and eliminates refresh overhead.
 */

const SUPABASE_URL = 'https://vwceqvxotkstkiwevdox.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDI3MDQsImV4cCI6MjA4NDc3ODcwNH0.9VM8_6rpX6z5VGDVvzIPkgBpjkNunIPxyQDzmHQwKBA';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwMjcwNCwiZXhwIjoyMDg0Nzc4NzA0fQ.VZxfLWXwj49jstz15Td68YGpLDjk9bi-2an6NgzbSec';

// Singleton Instance Exports
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

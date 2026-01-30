import { createClient } from '@supabase/supabase-js';

/**
 * SOVEREIGN IDENTITY CORE: HARDENED SINGLETON [V142.0]
 * Isolated clients to prevent "Multiple GoTrueClient instances" warnings.
 */

const SUPABASE_URL = 'https://vwceqvxotkstkiwevdox.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDI3MDQsImV4cCI6MjA4NDc3ODcwNH0.9VM8_6rpX6z5VGDVvzIPkgBpjkNunIPxyQDzmHQwKBA';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwMjcwNCwiZXhwIjoyMDg0Nzc4NzA0fQ.VZxfLWXwj49jstz15Td68YGpLDjk9bi-2an6NgzbSec';

// Client 1: Standard Anonymous Uplink
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: 'sovereign-anon-session',
    persistSession: true,
    autoRefreshToken: true
  }
});

// Client 2: Privileged Service Role Uplink
// CRITICAL: Isolated storageKey prevents GoTrueClient collisions
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    storageKey: 'sovereign-admin-vault', 
    autoRefreshToken: false,
    persistSession: false
  }
});

import { createClient } from '@supabase/supabase-js';

/**
 * SOVEREIGN IDENTITY CORE: HARDENED SINGLETON [V12.1]
 * 
 * To resolve 'supabaseUrl is required' errors, keys are hardcoded 
 * per Architect's direct mission directive.
 */

// CORE NEXUS CONFIGURATION
const SUPABASE_URL = 'https://vwceqvxotkstkiwevdox.supabase.co';

// NEXT_PUBLIC_SUPABASE_ANON_KEY: Standard Public Access
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDI3MDQsImV4cCI6MjA4NDc3ODcwNH0.9VM8_6rpX6z5VGDVvzIPkgBpjkNunIPxyQDzmHQwKBA';

// SUPABASE_SERVICE_ROLE_KEY: Admin Vault Access (BYPASS RLS)
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2VxdnhvdGtzdGtpd2V2ZG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwMjcwNCwiZXhwIjoyMDg0Nzc4NzA0fQ.VZxfLWXwj49jstz15Td68YGpLDjk9bi-2an6NgzbSec';

// Client 1: Standard Anonymous Uplink
// Used for standard auth and data fetching within RLS constraints
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client 2: Privileged Service Role Uplink
// Used exclusively for administrative provisioning (auth.admin namespace)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * SQL DIRECTIVE: PERMISSION VERIFICATION
 * Run the following in the Supabase SQL Editor to ensure full sync:
 * 
 * -- 1. Grant Service Role the power to bypass RLS
 * ALTER ROLE service_role BYPASSRLS;
 * 
 * -- 2. Verify bypass status
 * SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'service_role';
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration.
 *
 * Reads:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY (anon key)
 *
 * NOTE: Never store the service role key in the frontend.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Missing Supabase env vars. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set."
  );
}

// PUBLIC_INTERFACE
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

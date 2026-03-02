// ─────────────────────────────────────────────────────────
// Supabase Client — AskMyNotes
// ─────────────────────────────────────────────────────────
// Two clients:
//   1. `supabase`       — browser-safe (anon key), used in client components
//   2. `supabaseAdmin`  — server-only (service_role key), bypasses RLS
//      Used in API routes so we can write with Firebase UID context.
// ─────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser-safe client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client (service_role — bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

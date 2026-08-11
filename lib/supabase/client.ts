import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components ('use client'). Safe to expose — these are the
// public URL + anon key, restricted by Row Level Security policies in
// supabase/schema.sql, not a secret credential.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

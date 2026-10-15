// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// Use untyped client for browser — our own Database types handle the typing
// The generic parameter only works when Supabase auto-generates types via CLI
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

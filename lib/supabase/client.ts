import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Supabase client for Client Components (e.g. the login form, realtime
 * subscriptions). Backed by cookies under the hood — @supabase/ssr keeps
 * this in sync with the server client automatically, so a session started
 * here is immediately visible to Server Components and the Proxy.
 *
 * NOTE: if your project uses Supabase's newer "publishable key" naming,
 * swap NEXT_PUBLIC_SUPABASE_ANON_KEY for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * to match whatever your .env.local already defines — the value works the
 * same either way, only the env var name differs.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
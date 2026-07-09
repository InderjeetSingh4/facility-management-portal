import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(keysToSet) {
          try { keysToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
      // 👇 add this block — bypasses Next.js's patched global fetch,
      // which is what's swallowing the auth request
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, { ...options, cache: 'no-store' })
        },
      },
    }
  )
}
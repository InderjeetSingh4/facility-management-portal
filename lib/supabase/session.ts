import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

const PROTECTED_PREFIXES = ['/admin', '/tasks', '/portal'] as const

/**
 * Refreshes the Supabase session on every matched request and applies
 * coarse-grained gating: authenticated-or-not, nothing more specific.
 *
 * "/" is now the unified sign-in/sign-up page and handles its own
 * already-authenticated bounce client-side (see app/page.tsx) — so there's
 * no special-casing of a login route needed here anymore.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getClaims() verifies the JWT signature on every call.
  // Never substitute getSession() here — a session read straight from
  // cookies can be spoofed and must not be trusted for authorization.
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims)

  const path = request.nextUrl.pathname
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))

  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
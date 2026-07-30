import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Fast path for local dev mode: return immediately so dev requests never stall
  if (process.env.NODE_ENV === 'development') {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      'https://durcfljdheewazrlevip.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cmNmbGpkaGVld2F6cmxldmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzYwNjMsImV4cCI6MjA5ODgxMjA2M30.tLUHIO8SU5grUcdLPu8badcY_np0RIXnMjmBZwAj9Dg',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/signup') || 
                        request.nextUrl.pathname === '/'

    if (!user && !isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }
  } catch (e) {
    console.error('Middleware updateSession error:', e)
  }

  return supabaseResponse
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Initialize the Supabase client (using the hardcoded strings that bypassed your network bug)
  const supabase = createServerClient(
    'https://durcfljdheewazrlevip.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cmNmbGpkaGVld2F6cmxldmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzYwNjMsImV4cCI6MjA5ODgxMjA2M30.tLUHIO8SU5grUcdLPu8badcY_np0RIXnMjmBZwAj9Dg', // 🚨 PASTE YOUR REAL 150+ CHAR ANON KEY HERE
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

  // Securely fetch the current user's session locally (fast, no network roundtrip)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // Define which pages don't require being logged in
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup') || 
                      request.nextUrl.pathname === '/'

  // THE BOUNCER LOGIC
  if (!user && !isAuthRoute) {
    // If they have no user session and try to access a protected page, kick them to home
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    // If they ARE logged in but try to go to the login/signup page, force them into the portal
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
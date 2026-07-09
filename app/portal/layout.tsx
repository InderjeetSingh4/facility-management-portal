import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logOut } from '@/app/auth/actions'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const role = user.user_metadata?.role || 'staff'
  const email = user.email || 'User'
  const formattedRole = role.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
  const initial = email.charAt(0).toUpperCase()
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="flex w-64 flex-col justify-between border-r border-white/60 bg-white/50 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
        <div>
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-white/60 p-3 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800/60 dark:ring-white/10">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-lg font-bold text-white dark:bg-white dark:text-neutral-900">
              {initial}
            </div>
            <div className="overflow-hidden">
              <h2 className="truncate text-sm font-bold leading-tight">{email.split('@')[0]}</h2>
              <p className="truncate text-xs font-medium text-blue-600 dark:text-blue-400">{formattedRole}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Main Menu</div>
            <Link href="/portal" className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-800">
              <svg className="h-4 w-4 flex-shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
              </svg>
              Dashboard
            </Link>
            <Link href="/portal/tasks" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white">
              <svg className="h-4 w-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              My Tasks
            </Link>
            <Link href="/portal/complaints" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white">
              <svg className="h-4 w-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Complaints
            </Link>
            <Link href="/portal/conference" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white">
              <svg className="h-4 w-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Conference
            </Link>

            {isAdmin && (
              <>
                <div className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Management</div>
                <Link href="/portal/staff" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white">
                  <svg className="h-4 w-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage Staff
                </Link>
                <Link href="/portal/analytics" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-white">
                  <svg className="h-4 w-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </Link>
              </>
            )}
          </nav>
        </div>

        <form action={logOut}>
          <button type="submit" className="w-full rounded-xl bg-red-50/50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100/50 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20">
            Sign Out
          </button>
        </form>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      
    </div>
  )
}
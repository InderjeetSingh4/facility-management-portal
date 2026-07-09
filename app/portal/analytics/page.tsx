import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getWeeklyAnalytics } from '../actions'
import AnalyticsChart from './Chart'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Admin access only
  const role = user.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'
  if (!isAdmin) redirect('/portal')

  const analytics = await getWeeklyAnalytics()

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ── Page-Level Return Home Button ──────────────────────────────────── */}
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
        ← Return Home
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Performance Analytics
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          Last 7 days facility overview.
        </p>
      </header>

      {analytics ? (
        <>
          {/* ── Top Stats Cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Tasks Completed (7d)
              </p>
              <p className="mt-2 text-4xl font-bold text-neutral-900 dark:text-white">
                {analytics.totalCompletedTasks}
              </p>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Open Complaints
              </p>
              <p className="mt-2 text-4xl font-bold text-amber-600 dark:text-amber-500">
                {analytics.openComplaints}
              </p>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Resolved Complaints
              </p>
              <p className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-500">
                {analytics.resolvedComplaints}
              </p>
            </div>
          </div>

          {/* ── Recharts Bar Chart ──────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Daily Task Completions
            </h2>
            <AnalyticsChart data={analytics.chartData} />
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/30 p-12 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/30">
          <p className="text-sm text-neutral-500">No data available for your facility.</p>
        </div>
      )}
    </div>
  )
}

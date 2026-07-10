import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeeklyAnalytics } from '../actions'
import AnalyticsChart from './Chart'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'

async function AnalyticsContent() {
  const analytics = await getWeeklyAnalytics()

  if (!analytics) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface-solid/30 p-12 text-center backdrop-blur-xl mt-8">
        <p className="text-sm text-secondary">No data available for your facility.</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Top Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:gap-8 sm:grid-cols-3 mt-8">
        <div className="rounded-3xl border border-border bg-surface p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] shadow-sm backdrop-blur-xl transition hover:shadow-md">
          <p className="text-xs xl:text-sm font-semibold uppercase tracking-widest text-secondary">
            Tasks Completed (7d)
          </p>
          <p className="mt-2 text-5xl xl:text-6xl font-bold text-primary">
            {analytics.totalCompletedTasks}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] shadow-sm backdrop-blur-xl transition hover:shadow-md">
          <p className="text-xs xl:text-sm font-semibold uppercase tracking-widest text-secondary">
            Open Complaints
          </p>
          <p className="mt-2 text-5xl xl:text-6xl font-bold text-warning">
            {analytics.openComplaints}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] shadow-sm backdrop-blur-xl transition hover:shadow-md">
          <p className="text-xs xl:text-sm font-semibold uppercase tracking-widest text-secondary">
            Resolved Complaints
          </p>
          <p className="mt-2 text-5xl xl:text-6xl font-bold text-success">
            {analytics.resolvedComplaints}
          </p>
        </div>
      </div>

      {/* ── Recharts Bar Chart ──────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-surface p-6 xl:p-8 shadow-sm backdrop-blur-xl mt-8">
        <h2 className="text-sm xl:text-base font-semibold uppercase tracking-widest text-secondary">
          Daily Task Completions
        </h2>
        <AnalyticsChart data={analytics.chartData} />
      </div>
    </>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Metrics Row */}
      <div className="grid gap-6 xl:gap-8 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl bg-surface-solid/50 min-h-[160px] xl:min-h-[180px] animate-pulse"></div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="rounded-3xl bg-surface-solid/50 h-[400px] mt-8 animate-pulse"></div>
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) redirect('/')

  const role = user.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  if (!isAdmin) redirect('/portal')

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Analytics & Insights"
        description="Facility performance and task completion metrics."
        showBackButton={true}
      />

      <div className="mt-2">
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsContent />
        </Suspense>
      </div>
    </div>
  )
}

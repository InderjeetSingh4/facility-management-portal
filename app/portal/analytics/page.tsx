import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeeklyAnalytics } from '../actions'
import AnalyticsChart from './Chart'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import WeeklyReportButton from '@/components/WeeklyReportButton'
import StatusPill from '@/components/ui/StatusPill'
import SkeletonCard from '@/components/ui/SkeletonCard'

async function AnalyticsContent() {
  const analytics = await getWeeklyAnalytics()

  if (!analytics) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted p-12 text-center mt-6">
        <p className="text-sm text-muted-foreground">No data available for your facility.</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Top Stats Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
        <div className="bg-card border border-border border-t-2 border-t-[var(--accent)] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow min-h-[140px] flex flex-col justify-center">
          <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground">
            Tasks Completed (7d)
          </p>
          <p className="mt-2 font-mono text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {analytics.totalCompletedTasks}
          </p>
        </div>
        <div className="bg-card border border-border border-t-2 border-t-[var(--accent-dim)] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow min-h-[140px] flex flex-col justify-center">
          <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground">
            Open Complaints
          </p>
          <p className="mt-2 font-mono text-3xl sm:text-4xl font-extrabold text-warning tracking-tight">
            {analytics.openComplaints}
          </p>
        </div>
        <div className="bg-card border border-border border-t-2 border-t-[var(--accent-dim)] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow min-h-[140px] flex flex-col justify-center">
          <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground">
            Resolved Complaints
          </p>
          <p className="mt-2 font-mono text-3xl sm:text-4xl font-extrabold text-success tracking-tight">
            {analytics.resolvedComplaints}
          </p>
        </div>
      </div>

      {/* ── Recharts Bar Chart ── */}
      <div className="bg-card border border-border rounded-2xl p-7 shadow-sm mt-6">
        <h2 className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground mb-4">
          Daily Task Completions
        </h2>
        <AnalyticsChart data={analytics.chartData} />
      </div>

      {/* ── Attendance Log ── */}
      <div className="mt-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-border">
          <h2 className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted-foreground">
            Today's Attendance Log
          </h2>
        </div>
        <Suspense fallback={
          <div className="p-8 text-center text-sm text-muted-foreground">Loading logs...</div>
        }>
          <AttendanceLogContent />
        </Suspense>
      </div>
    </>
  )
}

async function AttendanceLogContent() {
  const supabase = await createClient()
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const { data: logs, error } = await supabase
    .from('attendance')
    .select(`
      id,
      created_at,
      check_out_time,
      status,
      distance_from_plant_meters,
      users ( full_name, role )
    `)
    .gte('created_at', `${todayDate}T00:00:00+05:30`)
    .lt('created_at', `${todayDate}T23:59:59+05:30`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !logs || logs.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        No attendance records found for today.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-muted dark:bg-transparent border-b border-border">
          <tr>
            <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase text-muted-foreground">Time (In/Out)</th>
            <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase text-muted-foreground">Staff Member</th>
            <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase text-muted-foreground">Status</th>
            <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase text-muted-foreground">Distance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log: any) => {
            const isPresent = log.status === 'present'
            const inTime = new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            const outTime = log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null
            const userName = log.users?.full_name || 'Unknown User'
            const userRole = log.users?.role || 'staff'

            return (
              <tr key={log.id} className="hover:bg-muted transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex flex-col font-mono">
                    <span className="font-bold text-foreground">{inTime}</span>
                    {outTime && <span className="text-xs text-muted-foreground mt-0.5">Out: {outTime}</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{userName}</span>
                    <span className="text-xs font-medium text-muted-foreground mt-0.5 capitalize">{userRole.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {isPresent ? (
                    outTime
                      ? <StatusPill status="approved" />
                      : <span className="inline-flex items-center gap-1.5 rounded-full border border-success bg-transparent px-2.5 py-1 text-[11px] font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />On Duty</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-danger bg-transparent px-2.5 py-1 text-[11px] font-semibold text-danger"><span className="h-1.5 w-1.5 rounded-full bg-danger" />Out of Range</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm font-mono text-muted-foreground">
                  {log.distance_from_plant_meters}m
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 mt-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
      </div>
      <SkeletonCard className="h-[400px] rounded-2xl" lines={2} />
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
    <div>
      <PageHeader
        title="Analytics & Insights"
        description="Facility performance and task completion metrics."
        showBackButton={true}
        action={<WeeklyReportButton />}
      />

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}

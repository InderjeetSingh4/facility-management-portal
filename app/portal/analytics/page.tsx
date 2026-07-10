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

      {/* ── Attendance Log ──────────────────────────────────────────────────── */}
      <div className="mt-8 rounded-3xl border border-border bg-surface shadow-sm backdrop-blur-xl overflow-hidden">
        <div className="p-6 xl:p-8 border-b border-border">
          <h2 className="text-sm xl:text-base font-semibold uppercase tracking-widest text-secondary">
            Today's Attendance Log
          </h2>
        </div>
        <Suspense fallback={<div className="p-12 text-center animate-pulse text-muted">Loading logs...</div>}>
          <AttendanceLogContent />
        </Suspense>
      </div>
    </>
  )
}

async function AttendanceLogContent() {
  const supabase = await createClient()
  
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  // Note: users table needs to be joined. We query attendance and join users.
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
      <div className="p-12 text-center text-sm text-secondary bg-surface-solid/30">
        No attendance records found for today.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface-solid/50 text-secondary">
          <tr>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Time (In/Out)</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Staff Member</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Check-in Distance</th>
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
              <tr key={log.id} className="transition-colors hover:bg-surface-solid/30">
                <td className="px-6 py-4 font-medium">
                  <div className="flex flex-col">
                    <span>{inTime}</span>
                    {outTime && <span className="text-xs text-muted">Out: {outTime}</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-primary">{userName}</span>
                    <span className="text-xs text-muted capitalize">{userRole.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isPresent ? (outTime ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success') : 'bg-destructive/10 text-destructive'
                  }`}>
                    {isPresent ? (outTime ? 'Shift Completed' : 'On Duty') : 'Out of Range'}
                  </span>
                </td>
                <td className="px-6 py-4 text-secondary">
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

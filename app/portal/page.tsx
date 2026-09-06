import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteNotice, getExecutiveMetrics } from './actions'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import WeeklyReportButton from '@/components/WeeklyReportButton'
import SkeletonCard from '@/components/ui/SkeletonCard'
import GlassCard from '@/components/ui/GlassCard'
import AttendanceWidget from '@/components/AttendanceWidget'
import ExecutiveDashboardView from '@/components/ExecutiveDashboardView'
import { isSystemExecutive, isAdmin as checkIsAdmin, isCleaner as checkIsCleaner, formatRoleName } from '@/lib/auth/rbac'
import { Plus, Trash2, TrendingUp, ClipboardList, BellRing } from 'lucide-react'

function ProgressRing({
  value,
  max,
  size = 76,
  stroke = 5,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
}) {
  const pct = max > 0 ? (value / max) * 100 : 0

  return (
    <div 
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--accent) ${pct}%, var(--bg-surface-raised) 0)`
      }}
    >
      <div 
        className="absolute bg-bg-surface rounded-full flex items-center justify-center"
        style={{
          width: size - stroke * 2,
          height: size - stroke * 2,
        }}
      >
        <span className="font-mono text-sm font-bold text-primary dark:text-text-primary">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

async function DashboardStatsAndNotices({ plantId, isAdmin, isCleaner, userId }: { plantId: string; isAdmin: boolean; isCleaner: boolean; userId: string }) {
  const supabase = await createClient()

  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  const todayDOW = new Date(`${todayDate}T00:00:00Z`).getUTCDay()

  const [
    { data: statsData },
    { data: notices },
    { data: attendanceData }
  ] = await Promise.all([
    supabase.rpc('get_dashboard_stats', { p_plant_id: plantId, p_today: todayDate, p_dow: todayDOW }),
    supabase.from('notices').select('*').order('created_at', { ascending: false }),
    isCleaner ? supabase
      .from('attendance')
      .select('status, created_at, check_out_time')
      .eq('user_id', userId)
      .gte('created_at', `${todayDate}T00:00:00+05:30`)
      .lt('created_at', `${todayDate}T23:59:59+05:30`)
      .limit(1)
      .single() : Promise.resolve({ data: null })
  ])

  const totalToday = statsData?.totalTasks || 0
  const completedToday = statsData?.completedTasks || 0
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  const todayStatus = attendanceData?.status as 'present' | 'rejected_out_of_range' | null
  const checkInTime = attendanceData?.created_at ? new Date(attendanceData.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : undefined
  const checkOutTime = attendanceData?.check_out_time ? new Date(attendanceData.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : undefined

  return (
    <>
      {isCleaner && (
        <AttendanceWidget todayStatus={todayStatus} checkInTime={checkInTime} checkOutTime={checkOutTime} />
      )}

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mt-4">
        {/* Tasks Today */}
        <GlassCard interactive className="p-5 sm:p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted dark:text-text-muted">Tasks Today</p>
          </div>
          <div>
            <p className="font-mono text-3xl sm:text-4xl font-extrabold text-primary dark:text-text-primary tracking-tight">{totalToday}</p>
            {totalToday === 0 ? (
              <p className="mt-1.5 text-xs text-muted dark:text-text-muted font-medium">You're all caught up for today!</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted dark:text-text-muted font-medium">checklist items</p>
            )}
          </div>
        </GlassCard>

        {/* Completed */}
        <GlassCard interactive className="p-5 sm:p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted dark:text-text-muted">Completed</p>
          </div>
          <div>
            <p className="font-mono text-3xl sm:text-4xl font-extrabold text-primary dark:text-text-primary tracking-tight">{completedToday}</p>
            {totalToday === 0 ? (
              <p className="mt-1.5 text-xs text-muted dark:text-text-muted font-medium">No tasks to complete yet.</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted dark:text-text-muted font-medium">of {totalToday} tasks</p>
            )}
          </div>
        </GlassCard>

        {/* Active Notices */}
        <GlassCard interactive className="p-5 sm:p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted dark:text-text-muted">Active Notices</p>
          </div>
          <div>
            <p className="font-mono text-3xl sm:text-4xl font-extrabold text-primary dark:text-text-primary tracking-tight">{notices?.length || 0}</p>
            {notices?.length === 0 ? (
              <p className="mt-1.5 text-xs text-muted dark:text-text-muted font-medium">No active notices on the board.</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted dark:text-text-muted font-medium">currently on the board</p>
            )}
          </div>
        </GlassCard>

        {/* Progress Ring */}
        <GlassCard interactive className="p-5 sm:p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase text-muted dark:text-text-muted">Progress</p>
          </div>
          <div className="flex items-center gap-4 mt-auto">
            <div className="relative flex-shrink-0">
              <ProgressRing value={completedToday} max={totalToday} size={56} stroke={4} />
            </div>
            <div>
              <p className="text-xl font-bold text-primary dark:text-text-primary tracking-tight">
                {completedToday}<span className="text-muted dark:text-text-muted text-base font-medium">/{totalToday}</span>
              </p>
              <Link href="/portal/tasks" className="mt-0.5 inline-block text-xs text-[var(--text-primary)] hover:underline hover:text-[var(--text-primary)] font-medium transition-colors">
                View checklist →
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Progress Bar ── */}
      {totalToday > 0 && (
        <GlassCard className="p-5 sm:p-6 mt-6">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold text-primary">Daily Completion Rate</p>
            <p className="text-xs sm:text-sm font-bold text-primary">{pct}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-dim to-accent transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted font-medium">
            {completedToday === totalToday && totalToday > 0
              ? '🎉 All tasks completed for today.'
              : `${totalToday - completedToday} task${totalToday - completedToday !== 1 ? 's' : ''} remaining`}
          </p>
        </GlassCard>
      )}

      {/* ── Digital Noticeboard ── */}
      <GlassCard className="mt-6 overflow-hidden !p-0">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-primary dark:text-text-primary tracking-tight">Noticeboard</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {notices?.map((notice: any) => (
            <div
              key={notice.id}
              className="relative overflow-hidden bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-muted active:scale-95 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              {notice.image_url && (
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted mb-3">
                  <Image
                    src={notice.image_url}
                    alt={notice.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-primary dark:text-text-primary tracking-tight">{notice.title}</h4>
                    {isAdmin && (
                      <form action={deleteNotice.bind(null, notice.id)}>
                        <button
                          type="submit"
                          className="flex-shrink-0 rounded-full p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500 active:scale-95 transition-all duration-200 -mt-1 -mr-1"
                          title="Delete Notice"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted dark:text-text-muted leading-relaxed font-medium line-clamp-3">
                    {notice.content ?? notice.details}
                  </p>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2 pt-3 border-t border-border">
                  {notice.author_name ? `${notice.author_name} · ` : ''}
                  {new Date(notice.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Notice Placeholder Card */}
          {isAdmin && (
            <Link
              href="/portal/new-notice"
              className="relative overflow-hidden bg-card border border-dashed border-border rounded-xl p-5 hover:bg-muted transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center min-h-[180px]"
            >
              <div className="h-10 w-10 rounded-full bg-[var(--accent-solid)] dark:bg-bg-surface-raised flex items-center justify-center mb-3">
                <Plus size={20} className="text-[var(--accent-solid-text)] dark:text-accent" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-primary dark:text-text-primary">Add New Notice</h4>
              <p className="mt-0.5 text-xs font-medium text-muted dark:text-text-muted">Post a new update for the team</p>
            </Link>
          )}

          {!isAdmin && notices?.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center bg-card">
              <p className="text-xs font-bold text-muted dark:text-text-muted">No notices have been posted yet.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
        <SkeletonCard className="h-[160px] rounded-2xl" lines={1} />
      </div>
      <SkeletonCard className="h-[320px] rounded-2xl" lines={3} />
    </div>
  )
}

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Please sign in to view this dashboard.</div>
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, plant_id, full_name')
    .eq('id', user.id)
    .single()

  const email = user.email || 'User'
  const role = profile?.role || user.user_metadata?.role || 'staff'
  const formattedRole = formatRoleName(role)
  const isExecutive = isSystemExecutive(role)
  const isAdmin = checkIsAdmin(role)
  const isCleaner = checkIsCleaner(role)
  const plantId = profile?.plant_id || user.app_metadata?.plant_id
  const fullName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0]

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // 👑 System Executive View
  if (isExecutive) {
    const [metrics, { data: notices }] = await Promise.all([
      getExecutiveMetrics(),
      supabase.from('notices').select('*').order('created_at', { ascending: false })
    ])

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Executive Overview — ${fullName}`}
          description={`${today} · Oversight & Management Dashboard`}
          action={<WeeklyReportButton />}
        />

        {plantId ? (
          <ExecutiveDashboardView metrics={metrics} notices={notices || []} />
        ) : (
          <div className="mt-6 text-sm text-muted">No facility assigned.</div>
        )}
      </div>
    )
  }

  // 🛠️ Operational View (Facility Manager & Housekeeping/Staff)
  return (
    <div>
      <PageHeader
        title={`Welcome, ${fullName}`}
        description={`${today} · ${formattedRole}`}
        action={isAdmin ? <WeeklyReportButton /> : undefined}
      />

      {plantId ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardStatsAndNotices plantId={plantId} isAdmin={isAdmin} isCleaner={isCleaner} userId={user.id} />
        </Suspense>
      ) : (
        <div className="mt-6 text-sm text-muted">No facility assigned.</div>
      )}
    </div>
  )
}
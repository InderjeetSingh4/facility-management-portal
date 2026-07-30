import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteNotice } from './actions'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import WeeklyReportButton from '@/components/WeeklyReportButton'
import SkeletonCard from '@/components/ui/SkeletonCard'
import GlassCard from '@/components/ui/GlassCard'
import AttendanceWidget from '@/components/AttendanceWidget'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        {/* Tasks Today */}
        <GlassCard interactive className="p-8 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Tasks Today</p>
          </div>
          <div>
            <p className="font-mono text-5xl font-bold text-primary dark:text-text-primary tracking-tighter">{totalToday}</p>
            {totalToday === 0 ? (
              <p className="mt-2 text-[13px] text-muted dark:text-text-muted font-medium">You're all caught up for today!</p>
            ) : (
              <p className="mt-2 text-[13px] text-muted dark:text-text-muted font-medium">checklist items</p>
            )}
          </div>
        </GlassCard>

        {/* Completed */}
        <GlassCard interactive className="p-8 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Completed</p>
          </div>
          <div>
            <p className="font-mono text-5xl font-bold text-primary dark:text-text-primary tracking-tighter">{completedToday}</p>
            {totalToday === 0 ? (
              <p className="mt-2 text-[13px] text-muted dark:text-text-muted font-medium">No tasks to complete yet.</p>
            ) : (
              <p className="mt-2 text-[13px] text-muted dark:text-text-muted font-medium">of {totalToday} tasks</p>
            )}
          </div>
        </GlassCard>

        {/* Active Notices */}
        <GlassCard interactive className="p-8 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Active Notices</p>
          </div>
          <div>
            <p className="font-mono text-5xl font-bold text-primary dark:text-text-primary tracking-tighter">{notices?.length || 0}</p>
            {notices?.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted dark:text-text-muted font-medium">No active notices on the board.</p>
            ) : (
              <p className="mt-2 text-[13px] text-muted dark:text-text-muted font-medium">currently on the board</p>
            )}
          </div>
        </GlassCard>

        {/* Progress Ring */}
        <GlassCard interactive className="p-8 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Progress</p>
          </div>
          <div className="flex items-center gap-5 mt-auto">
            <div className="relative flex-shrink-0">
              <ProgressRing value={completedToday} max={totalToday} size={64} stroke={5} />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary dark:text-text-primary tracking-tight">
                {completedToday}<span className="text-muted dark:text-text-muted text-lg font-medium">/{totalToday}</span>
              </p>
              <Link href="/portal/tasks" className="mt-1 inline-block text-[13px] text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
                View checklist →
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Progress Bar ── */}
      {totalToday > 0 && (
        <GlassCard className="p-8 mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Daily Completion Rate</p>
            <p className="text-sm font-bold text-primary">{pct}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 text-[13px] text-muted font-medium">
            {completedToday === totalToday && totalToday > 0
              ? '🎉 All tasks completed for today.'
              : `${totalToday - completedToday} task${totalToday - completedToday !== 1 ? 's' : ''} remaining`}
          </p>
        </GlassCard>
      )}

      {/* ── Digital Noticeboard ── */}
      <GlassCard className="mt-8 overflow-hidden !p-0">
        <div className="px-6 py-5 border-b border-white/40 dark:border-border-hairline flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-primary dark:text-text-primary tracking-tight">Noticeboard</h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notices?.map((notice: any) => (
            <div
              key={notice.id}
              className="relative overflow-hidden bg-white dark:bg-bg-surface border border-white/80 dark:border-transparent rounded-[14px] p-6 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-bg-surface-raised active:scale-95 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              {notice.image_url && (
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[14px] border border-black/5 dark:border-transparent dark:bg-bg-surface-raised mb-4 -mx-1">
                  <Image
                    src={notice.image_url}
                    alt={notice.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-base font-bold text-primary dark:text-text-primary tracking-tight">{notice.title}</h4>
                    {isAdmin && (
                      <form action={deleteNotice.bind(null, notice.id)}>
                        <button
                          type="submit"
                          className="flex-shrink-0 rounded-full p-2 text-muted hover:bg-red-500/10 hover:text-red-500 active:scale-95 transition-all duration-200 -mt-1 -mr-1"
                          title="Delete Notice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-muted dark:text-text-muted leading-relaxed font-medium line-clamp-3">
                    {notice.content ?? notice.details}
                  </p>
                </div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted dark:text-text-muted mt-2 pt-4 border-t border-black/5 dark:border-border-hairline">
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
              className="relative overflow-hidden bg-white/20 dark:bg-bg-surface border border-dashed border-gray-300 dark:border-border-dashed rounded-[14px] p-6 hover:bg-white/40 dark:hover:bg-bg-surface-raised transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px]"
            >
              <div className="h-12 w-12 rounded-full bg-[#3b82f6]/10 dark:bg-bg-surface-raised flex items-center justify-center mb-4">
                <Plus size={24} className="text-[#3b82f6] dark:text-accent" />
              </div>
              <h4 className="text-sm font-bold text-primary dark:text-text-primary">Add New Notice</h4>
              <p className="mt-1 text-[13px] font-medium text-muted dark:text-text-muted">Post a new update for the team</p>
            </Link>
          )}

          {!isAdmin && notices?.length === 0 && (
            <div className="col-span-full rounded-[14px] border border-dashed border-gray-300 dark:border-border-dashed p-16 text-center bg-white/20 dark:bg-bg-surface">
              <p className="text-sm font-bold text-muted dark:text-text-muted">No notices have been posted yet.</p>
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
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const email = user?.email || 'User'
  const role = user?.user_metadata?.role || 'staff'
  const formattedRole = role.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
  const isAdmin = role === 'local_admin' || role === 'super_admin'
  const isCleaner = role === 'cleaner' || role === 'housekeeper'
  let plantId = user?.app_metadata?.plant_id
  let fullName = user?.user_metadata?.full_name

  if (user?.id) {
    const { data: profile } = await supabase.from('users').select('plant_id, full_name').eq('id', user.id).single()
    if (!plantId) plantId = profile?.plant_id
    fullName = profile?.full_name || fullName || email.split('@')[0]
  } else {
    fullName = fullName || email.split('@')[0]
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div>
      <PageHeader
        title={`Welcome, ${fullName}`}
        description={`${today} · ${formattedRole}`}
        action={isAdmin ? <WeeklyReportButton /> : undefined}
      />

      {plantId ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardStatsAndNotices plantId={plantId} isAdmin={isAdmin} isCleaner={isCleaner} userId={user?.id || ''} />
        </Suspense>
      ) : (
        <div className="mt-6 text-sm text-muted">No facility assigned.</div>
      )}
    </div>
  )
}
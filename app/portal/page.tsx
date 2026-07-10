import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteNotice } from './actions'
import EnableNotifications from '@/components/EnableNotifications'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'

// ── Circular progress ring (server component – pure SVG) ────────────────────
function ProgressRing({
  value,
  max,
  size = 72,
  stroke = 5,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? value / max : 0
  const offset = circ * (1 - pct)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border"
      />
      {/* Fill */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-accent transition-all duration-700"
      />
    </svg>
  )
}

// ── Streaming Data Component ────────────────────────────────────────────────
async function DashboardStatsAndNotices({ plantId, isAdmin }: { plantId: string; isAdmin: boolean }) {
  const supabase = await createClient()

  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  const todayDOW = new Date(`${todayDate}T00:00:00Z`).getUTCDay()

  const [
    { data: statsData },
    { data: notices }
  ] = await Promise.all([
    supabase.rpc('get_dashboard_stats', { p_plant_id: plantId, p_today: todayDate, p_dow: todayDOW }),
    supabase.from('notices').select('*').order('created_at', { ascending: false })
  ])

  const totalToday = statsData?.totalTasks || 0
  const completedToday = statsData?.completedTasks || 0
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <>
      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 mt-8 xl:mt-10">
        {/* Tasks Today */}
        <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] transition-all hover:bg-surface-solid/50">
          <p className="text-secondary text-base">
            Tasks Today
          </p>
          <p className="mt-2 text-5xl xl:text-6xl text-primary font-semibold tracking-tight">
            {totalToday}
          </p>
          <p className="mt-2 text-secondary text-sm xl:text-base">checklist items</p>
        </div>

        {/* Completed */}
        <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] transition-all hover:bg-surface-solid/50">
          <p className="text-secondary text-base">
            Completed
          </p>
          <p className="mt-2 text-5xl xl:text-6xl text-primary font-semibold tracking-tight">
            {completedToday}
          </p>
          <p className="mt-2 text-secondary text-sm xl:text-base">of {totalToday} tasks</p>
        </div>

        {/* Active Notices */}
        <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] transition-all hover:bg-surface-solid/50">
          <p className="text-secondary text-base">
            Active Notices
          </p>
          <p className="mt-2 text-5xl xl:text-6xl text-primary font-semibold tracking-tight">
            {notices?.length || 0}
          </p>
          <p className="mt-2 text-secondary text-sm xl:text-base">on the board</p>
        </div>

        {/* Progress Ring */}
        <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-8 flex flex-col justify-center min-h-[160px] xl:min-h-[180px] transition-all hover:bg-surface-solid/50">
          <p className="text-secondary text-base">
            Progress
          </p>
          <div className="mt-3 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <ProgressRing value={completedToday} max={totalToday} size={84} stroke={6} />
              <span className="absolute inset-0 flex items-center justify-center text-base text-primary font-semibold tracking-tight">
                {pct}%
              </span>
            </div>
            <div>
              <p className="text-3xl xl:text-4xl text-primary font-semibold tracking-tight">
                {completedToday}<span className="text-secondary text-base font-normal">/{totalToday}</span>
              </p>
              <Link
                href="/portal/tasks"
                className="mt-1 inline-block text-secondary text-sm xl:text-base hover:text-primary transition-colors"
              >
                View checklist →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────────────── */}
      {totalToday > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-8 transition-all hover:bg-surface-solid/50 mt-8 xl:mt-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-secondary text-base xl:text-lg font-semibold">
              Daily Completion
            </p>
            <p className="text-primary font-semibold tracking-tight">{pct}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-secondary text-sm xl:text-base">
            {completedToday === totalToday && totalToday > 0
              ? 'All tasks completed for today.'
              : `${totalToday - completedToday} task${totalToday - completedToday !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      )}

      {/* ── Digital Noticeboard ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm p-6 xl:p-10 transition-all hover:bg-surface-solid/50 mt-8 xl:mt-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl xl:text-2xl text-primary font-semibold tracking-tight">Noticeboard</h2>
          
          {isAdmin && (
            <Link 
              href="/portal/new-notice"
              className="bg-accent text-accent-foreground rounded-2xl px-5 py-2.5 font-medium hover:opacity-90 shadow-sm transition-all flex items-center gap-2 text-sm xl:text-base"
            >
              <svg className="h-4 w-4 xl:h-5 xl:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Notice
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
          {!notices || notices.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center bg-surface-solid/20">
              <p className="text-secondary text-base">No notices have been posted yet.</p>
            </div>
          ) : (
            notices.map((notice: any) => (
              <div
                key={notice.id}
                className="relative overflow-hidden rounded-3xl bg-surface backdrop-blur-xl border border-border shadow-sm transition-all hover:bg-surface-solid/50 flex flex-col h-full"
              >
                {notice.image_url && (
                  <div className="relative w-full aspect-[4/3] border-b border-border bg-surface-solid/50">
                    <Image
                      src={notice.image_url}
                      alt={notice.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6 xl:p-8 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-primary text-lg xl:text-xl font-semibold tracking-tight">{notice.title}</h4>
                      {isAdmin && (
                        <form action={deleteNotice.bind(null, notice.id)}>
                          <button
                            type="submit"
                            className="flex-shrink-0 rounded-lg p-2 text-muted transition-all duration-300 hover:bg-surface-solid hover:text-primary -mt-2 -mr-2"
                            title="Delete Notice"
                          >
                            <svg className="h-4 w-4 xl:h-5 xl:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      )}
                    </div>
                    <p className="mt-2 text-secondary text-sm xl:text-base leading-relaxed">
                      {notice.content ?? notice.details}
                    </p>
                  </div>
                  
                  <p className="mt-4 text-muted text-xs xl:text-sm font-medium">
                    {notice.author_name ? `${notice.author_name} · ` : ''}
                    {new Date(notice.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 mt-8 xl:mt-10">
        <div className="rounded-3xl bg-surface-solid/50 h-[160px] xl:h-[180px]"></div>
        <div className="rounded-3xl bg-surface-solid/50 h-[160px] xl:h-[180px]"></div>
        <div className="rounded-3xl bg-surface-solid/50 h-[160px] xl:h-[180px]"></div>
        <div className="rounded-3xl bg-surface-solid/50 h-[160px] xl:h-[180px]"></div>
      </div>
      <div className="rounded-3xl bg-surface-solid/50 h-[400px] mt-8 xl:mt-10"></div>
    </div>
  )
}

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const email = user?.email || 'User'
  const role = user?.user_metadata?.role || 'staff'
  const formattedRole = role.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
  const isAdmin = role === 'local_admin' || role === 'super_admin'
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
      {/* ── Header (Renders instantly) ──────────────────────────────────────────────────────────── */}
      <PageHeader
        title={`Welcome back, ${fullName}`}
        description={`${today} • Signed in as ${formattedRole}`}
        action={<EnableNotifications />}
      />

      {plantId ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardStatsAndNotices plantId={plantId} isAdmin={isAdmin} />
        </Suspense>
      ) : (
        <div className="mt-8 xl:mt-10 text-secondary">No facility assigned.</div>
      )}
    </div>
  )
}
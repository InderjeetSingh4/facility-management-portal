import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteNotice, getTodayTasks } from './actions'
import EnableNotifications from '@/components/EnableNotifications'

// ── Circular progress ring (server component – pure SVG) ────────────────────
function ProgressRing({
  value,
  max,
  size = 72,
  stroke = 6,
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
        className="text-neutral-200 dark:text-neutral-700"
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
        className="text-emerald-500 transition-all duration-700"
      />
    </svg>
  )
}

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const email = user?.email || 'User'
  const role = user?.user_metadata?.role || 'staff'
  const formattedRole = role.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  const todayTasks = await getTodayTasks()
  const totalToday = todayTasks.length
  const completedToday = todayTasks.filter((t) => t.isCompleted).length
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            {today}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back, {email.split('@')[0]} 👋
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Signed in as{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {formattedRole}
            </span>
          </p>
        </div>
        
        <EnableNotifications />
      </header>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Tasks Today */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Tasks Today
          </p>
          <p className="mt-3 text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {totalToday}
          </p>
          <p className="mt-1 text-sm text-neutral-400">checklist items</p>
        </div>

        {/* Completed */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Completed
          </p>
          <p className="mt-3 text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {completedToday}
          </p>
          <p className="mt-1 text-sm text-neutral-400">of {totalToday} tasks</p>
        </div>

        {/* Progress Ring */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Progress
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <ProgressRing value={completedToday} max={totalToday} size={72} stroke={6} />
              <span className="absolute inset-0 flex items-center justify-center rotate-90 text-sm font-bold text-neutral-900 dark:text-white">
                {pct}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {completedToday}<span className="text-neutral-400">/{totalToday}</span>
              </p>
              <Link
                href="/portal/tasks"
                className="mt-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                View checklist →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────────────── */}
      {totalToday > 0 && (
        <div className="rounded-3xl border border-white/60 bg-white/50 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Daily Completion
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{pct}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            {completedToday === totalToday && totalToday > 0
              ? '🎉 All tasks completed for today!'
              : `${totalToday - completedToday} task${totalToday - completedToday !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      )}

      {/* ── Digital Noticeboard ──────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Digital Noticeboard</h2>
          
          {isAdmin && (
            <Link 
              href="/portal/new-notice"
              className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Notice
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {!notices || notices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No notices have been posted yet.</p>
            </div>
          ) : (
            notices.map((notice: any) => (
              <div
                key={notice.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-100 bg-white/60 p-5 transition hover:bg-white/80 dark:border-neutral-800/80 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/60"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{notice.title}</h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {notice.content ?? notice.details}
                  </p>

                  {notice.image_url && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <img
                        src={notice.image_url}
                        alt={notice.title}
                        className="max-h-64 w-full object-cover"
                      />
                    </div>
                  )}

                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    {notice.author_name ? `Posted by ${notice.author_name} · ` : ''}
                    {new Date(notice.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                
                {isAdmin && (
                  <form action={deleteNotice.bind(null, notice.id)}>
                    <button
                      type="submit"
                      className="flex-shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Delete Notice"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
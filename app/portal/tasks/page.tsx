import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteChecklistTask, getTodayTasks } from '../actions'
import TaskForm from './TaskForm'
import TaskCheckbox from './TaskCheckbox'

const FREQUENCY_BADGE: Record<string, { label: string; cls: string }> = {
  daily:   { label: 'Daily',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
  weekly:  { label: 'Weekly',  cls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' },
  'one-off': { label: 'One-Off', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  const tasks = await getTodayTasks()
  const completedCount = tasks.filter((t) => t.isCompleted).length
  const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
        ← Return Home
      </Link>
      
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {today}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Today&apos;s Checklist
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {isAdmin
            ? 'Manage tasks and track daily progress.'
            : 'Check off tasks as you complete them.'}
        </p>
      </header>

      {/* ── Progress Summary ────────────────────────────────────────────────── */}
      {tasks.length > 0 && (
        <div className="rounded-3xl border border-white/60 bg-white/50 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {completedCount === tasks.length
                ? '🎉 All done for today!'
                : `${completedCount} of ${tasks.length} completed`}
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{pct}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Admin: Add Task Form ─────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="mb-4 flex items-center gap-2">
            {/* Plus icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white">
              <svg className="h-4 w-4 text-white dark:text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Add New Task</h2>
          </div>
          <TaskForm />
        </div>
      )}

      {/* ── Task List ───────────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/30 p-12 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/30">
            <p className="text-3xl">📋</p>
            <p className="mt-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">No tasks for today</p>
            {isAdmin && (
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Use the form above to add a daily, weekly, or one-off task.
              </p>
            )}
          </div>
        ) : (
          tasks.map((task, i) => {
            const badge = FREQUENCY_BADGE[task.frequency] ?? FREQUENCY_BADGE.daily
            const dayLabel = task.frequency === 'weekly' && task.day_of_week != null
              ? DAYS[task.day_of_week]
              : null

            return (
              <div
                key={task.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800/70 dark:bg-neutral-900/60 dark:hover:bg-neutral-900/80 ${
                  task.isCompleted ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <TaskCheckbox taskId={task.id} isCompleted={task.isCompleted} />

                {/* Task info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold text-neutral-900 transition dark:text-white ${
                      task.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {/* Frequency badge */}
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}>
                      {badge.label}{dayLabel ? ` · ${dayLabel}` : ''}
                      {task.frequency === 'one-off' && task.target_date ? ` · ${task.target_date}` : ''}
                    </span>

                    {/* Completed by badge */}
                    {task.isCompleted && task.completedByName && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        {task.completedByName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin: delete button */}
                {isAdmin && (
                  <form action={deleteChecklistTask.bind(null, task.id)}>
                    <button
                      type="submit"
                      title="Delete Task"
                      className="flex-shrink-0 rounded-xl p-2 text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:text-neutral-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
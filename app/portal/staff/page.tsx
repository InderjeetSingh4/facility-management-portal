import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  super_admin: { label: 'Super Admin', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' },
  local_admin: { label: 'Admin',       cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
  housekeeper: { label: 'Housekeeper', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
  cleaner:     { label: 'Cleaner',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
  employee:    { label: 'Employee',    cls: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300' },
}

export default async function ManageStaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const role = user.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  if (!isAdmin) redirect('/portal')

  // Get admin's plant_id
  const { data: profile } = await supabase
    .from('users')
    .select('plant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plant_id) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/30 p-12 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/30">
        <p className="text-sm text-neutral-500">No facility assigned to your account.</p>
      </div>
    )
  }

  // Fetch all staff in the same plant
  const { data: staff, error } = await supabase
    .from('users')
    .select('id, full_name, role, phone, designation, is_on_duty, avatar_url, created_at')
    .eq('plant_id', profile.plant_id)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Failed to fetch staff:', error)
  }

  const staffList = staff || []

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
        ← Return Home
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Manage Staff
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {staffList.length} team member{staffList.length !== 1 ? 's' : ''} in your facility.
        </p>
      </header>

      {/* ── Staff List ──────────────────────────────────────────────────────── */}
      {staffList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/30 p-12 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/30">
          <p className="text-3xl">👥</p>
          <p className="mt-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            No staff members found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {staffList.map((member: any) => {
            const badge = ROLE_BADGE[member.role] ?? { label: member.role || 'Staff', cls: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300' }
            const initials = (member.full_name || '?')
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-neutral-800/70 dark:bg-neutral-900/60"
              >
                {/* Avatar */}
                {member.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {member.full_name}
                    </p>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-400">
                    {[member.designation, member.phone].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                </div>

                {/* Duty status */}
                <div className="flex-shrink-0">
                  {member.is_on_duty ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      On Duty
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                      Off Duty
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

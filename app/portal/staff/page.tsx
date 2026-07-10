import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  super_admin: { label: 'Super Admin', cls: 'bg-accent/20 text-accent' },
  local_admin: { label: 'Admin',       cls: 'bg-primary/20 text-primary' },
  housekeeper: { label: 'Housekeeper', cls: 'bg-warning/20 text-warning' },
  cleaner:     { label: 'Cleaner',     cls: 'bg-warning/20 text-warning' },
  employee:    { label: 'Employee',    cls: 'bg-secondary/20 text-secondary' },
}

async function StaffContent({ plantId }: { plantId: string }) {
  const supabase = await createClient()

  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  // Fetch all staff in the same plant
  const [
    { data: staff, error },
    { data: activeAttendances }
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, role, phone, designation, avatar_url, created_at')
      .eq('plant_id', plantId)
      .order('full_name', { ascending: true }),
    supabase
      .from('attendance')
      .select('user_id')
      .eq('plant_id', plantId)
      .eq('status', 'present')
      .is('check_out_time', null)
      .gte('created_at', `${todayDate}T00:00:00+05:30`)
      .lt('created_at', `${todayDate}T23:59:59+05:30`)
  ])

  if (error) {
    console.error('Failed to fetch staff:', error)
  }

  const staffList = staff || []
  const onDutyUserIds = new Set((activeAttendances || []).map(a => a.user_id))

  // Split into housekeepers and management
  const housekeepers = staffList.filter((m: any) => m.role === 'cleaner' || m.role === 'employee')
  const management = staffList.filter((m: any) => m.role === 'local_admin' || m.role === 'super_admin')

  const onDutyCount = housekeepers.filter((m: any) => onDutyUserIds.has(m.id)).length

  return (
    <div className="mt-2 space-y-10">
      {/* ── Housekeepers Section ──────────────────────────────────────────── */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl xl:text-2xl font-bold text-primary flex items-center gap-3">
            🧹 Housekeeping Staff
          </h2>
          <span className="text-sm font-semibold text-secondary rounded-full bg-surface-solid/50 px-4 py-1.5">
            {onDutyCount} of {housekeepers.length} on duty
          </span>
        </div>

        {housekeepers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 xl:p-16 text-center backdrop-blur-xl">
            <p className="text-3xl xl:text-4xl">👥</p>
            <p className="mt-3 text-sm font-semibold text-secondary">
              No housekeeping staff found
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {housekeepers.map((member: any) => {
              const badge = ROLE_BADGE[member.role] ?? { label: member.role || 'Staff', cls: 'bg-surface-solid/50 text-secondary' }
              const initials = (member.full_name || '?')
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              const isOnDuty = onDutyUserIds.has(member.id)

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-5 rounded-3xl border p-5 xl:p-7 shadow-sm backdrop-blur-xl transition hover:shadow-md ${
                    isOnDuty
                      ? 'border-success/30 bg-success/5'
                      : 'border-border bg-surface'
                  }`}
                >
                  {/* Avatar */}
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.full_name}
                      width={56}
                      height={56}
                      className="h-14 w-14 flex-shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-base font-bold ${
                      isOnDuty
                        ? 'bg-success text-white'
                        : 'bg-accent text-accent-foreground'
                    }`}>
                      {initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base xl:text-lg font-semibold text-primary">
                        {member.full_name}
                      </p>
                      <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">
                      {[member.designation, member.phone].filter(Boolean).join(' · ') || 'No details'}
                    </p>
                  </div>

                  {/* Duty status */}
                  <div className="flex-shrink-0">
                    {isOnDuty ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-success/20 px-4 py-1.5 text-xs font-semibold text-success">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                        </span>
                        On Duty
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-semibold text-secondary">
                        <span className="h-2 w-2 rounded-full bg-secondary" />
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

      {/* ── Management Section ────────────────────────────────────────────── */}
      {management.length > 0 && (
        <div>
          <h2 className="mb-6 text-xl xl:text-2xl font-bold text-primary flex items-center gap-3">
            🛡️ Management
          </h2>
          <div className="grid gap-4 xl:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {management.map((member: any) => {
              const badge = ROLE_BADGE[member.role] ?? { label: member.role || 'Staff', cls: 'bg-surface-solid/50 text-secondary' }
              const initials = (member.full_name || '?')
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-surface/60 p-5 xl:p-7 backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-base font-bold text-accent">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base xl:text-lg font-semibold text-primary">
                      {member.full_name}
                    </p>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StaffSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-3xl bg-surface-solid/50 h-[100px] xl:h-[120px] animate-pulse"></div>
      <div className="rounded-3xl bg-surface-solid/50 h-[100px] xl:h-[120px] animate-pulse"></div>
      <div className="rounded-3xl bg-surface-solid/50 h-[100px] xl:h-[120px] animate-pulse"></div>
    </div>
  )
}

import { approveUser, rejectUser } from '../actions'

async function PendingApprovalsContent({ plantId, isSuperAdmin }: { plantId: string, isSuperAdmin: boolean }) {
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('id, full_name, role, plant_id, created_at')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false })

  if (!isSuperAdmin) {
    query = query.eq('plant_id', plantId)
  }

  const { data: pending, error } = await query

  if (error) {
    console.error('Failed to fetch pending approvals:', error)
  }

  const pendingList = pending || []

  if (pendingList.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="mb-6 text-xl xl:text-2xl font-bold text-primary flex items-center gap-3">
          Pending Approvals (0)
        </h2>
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center backdrop-blur-xl">
          <p className="text-base text-secondary">No pending approvals at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-xl xl:text-2xl font-bold text-primary flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
        Pending Approvals ({pendingList.length})
      </h2>
      <div className="space-y-4">
        {pendingList.map((member: any) => {
          const badge = ROLE_BADGE[member.role] ?? { label: member.role || 'Staff', cls: 'bg-surface-solid/50 text-secondary' }
          const initials = (member.full_name || '?')
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          return (
            <div
              key={member.id}
              className="flex items-center gap-5 rounded-3xl border border-amber-200/50 bg-amber-50/30 p-5 xl:p-7 shadow-sm backdrop-blur-xl transition dark:border-amber-900/30 dark:bg-amber-900/10"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-base font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base xl:text-lg font-semibold text-primary">
                    {member.full_name}
                  </p>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted">
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-3">
                <form action={rejectUser.bind(null, member.id)}>
                  <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20">
                    Reject
                  </button>
                </form>
                <form action={approveUser.bind(null, member.id)}>
                  <button type="submit" className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                    Approve
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function ManageStaffPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) redirect('/')

  const role = user.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'
  const isSuperAdmin = role === 'super_admin'
  let plantId = user.app_metadata?.plant_id
  if (!plantId && user.id) {
    const { data: profile } = await supabase.from('users').select('plant_id').eq('id', user.id).single()
    plantId = profile?.plant_id
  }

  if (!isAdmin) redirect('/portal')

  return (
    <div className="animate-in fade-in duration-500">
      
      <PageHeader 
        title="Manage Staff"
        showBackButton={true}
      />

      {/* ── Pending Approvals ────────────────────────────────────────────────── */}
      {(plantId || isSuperAdmin) && (
        <Suspense fallback={<StaffSkeleton />}>
          <PendingApprovalsContent plantId={plantId || ''} isSuperAdmin={isSuperAdmin} />
        </Suspense>
      )}

      {/* ── Staff List ──────────────────────────────────────────────────────── */}
      {plantId ? (
        <Suspense fallback={<StaffSkeleton />}>
          <StaffContent plantId={plantId} />
        </Suspense>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-12 text-center backdrop-blur-xl">
          <p className="text-sm text-secondary">No facility assigned to your account.</p>
        </div>
      )}
    </div>
  )
}

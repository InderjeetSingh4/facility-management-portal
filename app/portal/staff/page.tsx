import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import { approveUser, rejectUser } from '../actions'
import { isSystemExecutive, isAdmin as checkIsAdmin, canApproveStaff } from '@/lib/auth/rbac'

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'Super Admin',
  system_executive: 'System Executive',
  local_admin: 'Facility Manager',
  housekeeper: 'Housekeeper',
  cleaner:     'Cleaner',
  employee:    'Staff Member',
}

async function StaffContent({
  plantId,
  isSuperAdmin,
  canApprove,
}: {
  plantId: string
  isSuperAdmin: boolean
  canApprove: boolean
}) {
  const supabase = await createClient()
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  // Parallel data fetching
  const [
    { data: staff },
    { data: activeAttendances },
    { data: pendingApprovals }
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
      .lt('created_at', `${todayDate}T23:59:59+05:30`),
    supabase
      .from('users')
      .select('id, full_name, role, plant_id, created_at')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
  ])

  const staffList = staff || []
  const onDutyUserIds = new Set((activeAttendances || []).map(a => a.user_id))
  const pendingList = (pendingApprovals || []).filter((u: any) => isSuperAdmin || u.plant_id === plantId)

  const housekeepers = staffList.filter((m: any) => m.role === 'cleaner' || m.role === 'employee' || m.role === 'housekeeper')
  const management = staffList.filter((m: any) => m.role === 'local_admin' || m.role === 'super_admin' || m.role === 'system_executive')
  const onDutyCount = housekeepers.filter((m: any) => onDutyUserIds.has(m.id)).length
  const dutyPercentage = housekeepers.length > 0 ? Math.round((onDutyCount / housekeepers.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6 w-full text-foreground">
      
      {/* ── WIDGET 1: Quick Stats Summary Cards ───────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-foreground tracking-wider uppercase mb-3">
          Overview & Metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 hover:border-primary/50 transition-all duration-200">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Total Facility Staff</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">{staffList.length}</span>
              <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-1 text-xs font-bold">Active</span>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 hover:border-primary/50 transition-all duration-200">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Housekeeping On Duty</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">{onDutyCount}</span>
              <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-1 text-xs font-bold">Of {housekeepers.length}</span>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 hover:border-primary/50 transition-all duration-200">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Shift Coverage</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">{dutyPercentage}%</span>
              <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-1 text-xs font-bold">Live</span>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 hover:border-primary/50 transition-all duration-200">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Pending Approvals</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">{pendingList.length}</span>
              <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-1 text-xs font-bold">
                {canApprove ? 'Action Needed' : 'Pending'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── WIDGET 2: Pending Member Approvals Table ─────────────────────── */}
      {pendingList.length > 0 && (
        <div>
          <p className="text-xs font-bold text-foreground tracking-wider uppercase mb-3">
            Pending Registration Approvals ({pendingList.length})
          </p>
          <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
            <div className="flex flex-col divide-y divide-border">
              {pendingList.map((member: any) => {
                const roleName = ROLE_BADGE[member.role] || member.role || 'Staff'
                const initials = (member.full_name || '?')
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <div key={member.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-primary dark:bg-transparent dark:bg-[image:var(--avatar-bg)] text-primary-foreground dark:text-foreground font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-foreground">{member.full_name}</h4>
                          <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-0.5 text-xs font-bold">
                            {roleName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                          Applied on {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {canApprove ? (
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <form action={rejectUser.bind(null, member.id)}>
                          <button
                            type="submit"
                            className="bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border font-bold py-2 px-4 rounded-xl text-xs transition-all"
                          >
                            Reject
                          </button>
                        </form>
                        <form action={approveUser.bind(null, member.id)}>
                          <button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/40 dark:bg-[image:var(--accent-gradient)] dark:shadow-[0_0_12px_var(--accent-glow)] font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm"
                          >
                            Approve Staff
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-semibold px-3 py-1 bg-muted rounded-full text-muted-foreground">
                        Awaiting Manager Action
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── WIDGET 3: Housekeeping Staff Roster Data Table ───────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-foreground tracking-wider uppercase">
            Housekeeping Staff ({housekeepers.length})
          </p>
          <span className="text-xs font-bold text-foreground">
            {onDutyCount} On Duty
          </span>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-2xl p-2 md:p-4">
          {housekeepers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-foreground">No housekeeping staff members found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {housekeepers.map((member: any) => {
                const roleName = ROLE_BADGE[member.role] || 'Staff'
                const initials = (member.full_name || '?')
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                const isOnDuty = onDutyUserIds.has(member.id)

                return (
                  <div key={member.id} className="p-3.5 rounded-xl hover:bg-muted transition-all duration-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.full_name}
                          width={44}
                          height={44}
                          className="h-11 w-11 flex-shrink-0 rounded-xl object-cover border border-border shadow-sm"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-primary dark:bg-transparent dark:bg-[image:var(--avatar-bg)] text-primary-foreground dark:text-foreground font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-foreground truncate">{member.full_name}</h4>
                          <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-0.5 text-xs font-bold flex-shrink-0">
                            {roleName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate font-semibold">
                          {[member.designation, member.phone].filter(Boolean).join(' · ') || 'Staff Member'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isOnDuty ? (
                        <span className="bg-success-bg text-success border border-success-border rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                          On Duty
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground border border-border rounded-lg px-3 py-1 text-xs font-semibold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
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
      </div>

      {/* ── WIDGET 4: Management Staff Table ─────────────────────────────── */}
      {management.length > 0 && (
        <div>
          <p className="text-xs font-bold text-foreground tracking-wider uppercase mb-3">
            Facility Executive Management ({management.length})
          </p>
          <div className="bg-card border border-border shadow-sm rounded-2xl p-2 md:p-4">
            <div className="flex flex-col gap-1">
              {management.map((member: any) => {
                const roleName = ROLE_BADGE[member.role] || 'Manager'
                const initials = (member.full_name || '?')
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <div key={member.id} className="p-3.5 rounded-xl hover:bg-muted transition-all duration-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-primary dark:bg-transparent dark:bg-[image:var(--avatar-bg)] text-primary-foreground dark:text-foreground font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-foreground truncate">{member.full_name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{member.phone || 'Executive Officer'}</p>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary border border-primary/20 dark:bg-badge-bg dark:text-badge-text dark:border-badge-border rounded-full px-3 py-1 text-xs font-bold">
                      {roleName}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function StaffSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-card border border-border rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-card border border-border rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-card border border-border rounded-2xl p-6 h-28 animate-pulse" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 h-64 animate-pulse" />
    </div>
  )
}

export default async function ManageStaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  let role = 'staff'
  let plantId: string | null = null

  const { data: profile } = await supabase.from('users').select('role, plant_id').eq('id', user.id).single()
  role = profile?.role || user.user_metadata?.role || 'staff'
  plantId = profile?.plant_id || user.app_metadata?.plant_id

  const isExec = isSystemExecutive(role)
  const isAdm = checkIsAdmin(role)
  const isSuperAdmin = role === 'super_admin'
  const canApprove = canApproveStaff(role)

  if (!isAdm && !isExec) redirect('/portal')

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isExec ? "Staff Directory & Oversight" : "Manage Staff"}
        description={
          isExec
            ? "Overview of facility staff roster, live duty tracking, and pending registrations."
            : "Facility staff directory, live duty tracking, and pending member approvals."
        }
        showBackButton={true}
      />

      {plantId ? (
        <Suspense fallback={<StaffSkeleton />}>
          <StaffContent plantId={plantId} isSuperAdmin={isSuperAdmin} canApprove={canApprove} />
        </Suspense>
      ) : (
        <div className="bg-card border border-border shadow-sm rounded-2xl p-12 text-center">
          <p className="text-sm font-bold text-foreground">No facility assigned to your account.</p>
        </div>
      )}
    </div>
  )
}

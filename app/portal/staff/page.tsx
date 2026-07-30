import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import { approveUser, rejectUser } from '../actions'

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'Super Admin',
  local_admin: 'Facility Manager',
  housekeeper: 'Housekeeper',
  cleaner:     'Cleaner',
  employee:    'Staff Member',
}

async function StaffContent({ plantId, isSuperAdmin }: { plantId: string; isSuperAdmin: boolean }) {
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
  const management = staffList.filter((m: any) => m.role === 'local_admin' || m.role === 'super_admin')
  const onDutyCount = housekeepers.filter((m: any) => onDutyUserIds.has(m.id)).length
  const dutyPercentage = housekeepers.length > 0 ? Math.round((onDutyCount / housekeepers.length) * 100) : 0

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto text-slate-900 dark:text-white">
      
      {/* ── WIDGET 1: Quick Stats Summary Cards ───────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase mb-3">
          Overview & Metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-2">Total Facility Staff</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{staffList.length}</span>
              <span className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold">Active</span>
            </div>
          </div>

          <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-2">Housekeeping On Duty</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{onDutyCount}</span>
              <span className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold">Of {housekeepers.length}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-2">Shift Coverage</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{dutyPercentage}%</span>
              <span className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold">Live</span>
            </div>
          </div>

          <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-2">Pending Approvals</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{pendingList.length}</span>
              <span className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold">Action Needed</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── WIDGET 2: Pending Member Approvals Table ─────────────────────── */}
      {pendingList.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase mb-3">
            Pending Registration Approvals ({pendingList.length})
          </p>
          <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-6">
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/10">
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
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{member.full_name}</h4>
                          <span className="bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-md px-2.5 py-0.5 text-xs font-bold">
                            {roleName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                          Applied on {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <form action={rejectUser.bind(null, member.id)}>
                        <button
                          type="submit"
                          className="bg-slate-100 text-slate-800 hover:text-slate-900 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 font-bold py-2 px-4 rounded-xl text-xs transition-all"
                        >
                          Reject
                        </button>
                      </form>
                      <form action={approveUser.bind(null, member.id)}>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm"
                        >
                          Approve Staff
                        </button>
                      </form>
                    </div>
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
          <p className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase">
            Housekeeping Staff ({housekeepers.length})
          </p>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
            {onDutyCount} On Duty
          </span>
        </div>

        <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-2 md:p-4">
          {housekeepers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-300">No housekeeping staff members found.</p>
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
                  <div key={member.id} className="p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.full_name}
                          width={44}
                          height={44}
                          className="h-11 w-11 flex-shrink-0 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{member.full_name}</h4>
                          <span className="bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-md px-2.5 py-0.5 text-xs font-bold flex-shrink-0">
                            {roleName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate font-semibold">
                          {[member.designation, member.phone].filter(Boolean).join(' · ') || 'Staff Member'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isOnDuty ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                          On Duty
                        </span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs font-semibold flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
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
          <p className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase mb-3">
            Facility Executive Management ({management.length})
          </p>
          <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-2 md:p-4">
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
                  <div key={member.id} className="p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{member.full_name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-semibold">{member.phone || 'Executive Officer'}</p>
                      </div>
                    </div>
                    <span className="bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-md px-2.5 py-1 text-xs font-bold">
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
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-28 animate-pulse" />
      </div>
      <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 rounded-2xl p-8 h-64 animate-pulse" />
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
    <div className="space-y-6">
      <PageHeader 
        title="Manage Staff"
        description="Facility staff directory, live duty tracking, and pending member approvals."
        showBackButton={true}
      />

      {plantId ? (
        <Suspense fallback={<StaffSkeleton />}>
          <StaffContent plantId={plantId} isSuperAdmin={isSuperAdmin} />
        </Suspense>
      ) : (
        <div className="bg-white dark:bg-bg-surface border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-12 text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-300">No facility assigned to your account.</p>
        </div>
      )}
    </div>
  )
}

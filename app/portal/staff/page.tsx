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
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto">
      
      {/* ── WIDGET 1: Quick Stats Summary Cards ───────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-3">
          Overview & Metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Total Facility Staff</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white font-mono">{staffList.length}</span>
              <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2 py-1 text-xs font-medium">Active</span>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Housekeeping On Duty</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white font-mono">{onDutyCount}</span>
              <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2 py-1 text-xs font-medium">Of {housekeepers.length}</span>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Shift Coverage</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white font-mono">{dutyPercentage}%</span>
              <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2 py-1 text-xs font-medium">Live</span>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Pending Approvals</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white font-mono">{pendingList.length}</span>
              <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2 py-1 text-xs font-medium">Action Needed</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── WIDGET 2: Pending Member Approvals Table ─────────────────────── */}
      {pendingList.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-3">
            Pending Registration Approvals ({pendingList.length})
          </p>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 md:p-8">
            <div className="flex flex-col divide-y divide-white/10">
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
                      <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-white">{member.full_name}</h4>
                          <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2 py-0.5 text-xs">
                            {roleName}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Applied on {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <form action={rejectUser.bind(null, member.id)}>
                        <button
                          type="submit"
                          className="bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20 border border-white/10 font-semibold py-2 px-4 rounded-xl text-xs transition-all"
                        >
                          Reject
                        </button>
                      </form>
                      <form action={approveUser.bind(null, member.id)}>
                        <button
                          type="submit"
                          className="bg-white text-black font-semibold hover:bg-neutral-200 py-2 px-4 rounded-xl text-xs transition-colors shadow-sm"
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
          <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
            Housekeeping Staff ({housekeepers.length})
          </p>
          <span className="text-xs font-semibold text-neutral-400">
            {onDutyCount} On Duty
          </span>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 md:p-8">
          {housekeepers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-neutral-500">No housekeeping staff members found.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
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
                  <div key={member.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.full_name}
                          width={44}
                          height={44}
                          className="h-11 w-11 flex-shrink-0 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-white truncate">{member.full_name}</h4>
                          <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2 py-0.5 text-xs flex-shrink-0">
                            {roleName}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          {[member.designation, member.phone].filter(Boolean).join(' · ') || 'Staff Member'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isOnDuty ? (
                        <span className="bg-white/10 text-neutral-200 border border-white/20 rounded-md px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          On Duty
                        </span>
                      ) : (
                        <span className="bg-white/[0.04] text-neutral-500 border border-white/5 rounded-md px-3 py-1 text-xs font-medium">
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
          <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-3">
            Facility Executive Management ({management.length})
          </p>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-6 md:p-8">
            <div className="flex flex-col divide-y divide-white/10">
              {management.map((member: any) => {
                const roleName = ROLE_BADGE[member.role] || 'Manager'
                const initials = (member.full_name || '?')
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <div key={member.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold text-white truncate">{member.full_name}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{member.phone || 'Executive Officer'}</p>
                      </div>
                    </div>
                    <span className="bg-white/10 text-neutral-300 border border-white/10 rounded-md px-2.5 py-1 text-xs font-semibold">
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
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-28 animate-pulse" />
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-28 animate-pulse" />
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-28 animate-pulse" />
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-28 animate-pulse" />
      </div>
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 h-64 animate-pulse" />
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
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,1)] rounded-3xl p-12 text-center">
          <p className="text-sm font-medium text-neutral-400">No facility assigned to your account.</p>
        </div>
      )}
    </div>
  )
}

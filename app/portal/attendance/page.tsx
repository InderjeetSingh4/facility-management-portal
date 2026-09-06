import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import AttendanceWidget from '@/components/AttendanceWidget'
import { isSystemExecutive, isAdmin as checkIsAdmin, isStaff } from '@/lib/auth/rbac'
import { Users, CheckCircle, XCircle, Clock, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  let role = 'staff'
  let plantId: string | null = null
  let fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  const { data: profile } = await supabase
    .from('users')
    .select('role, plant_id, full_name')
    .eq('id', user.id)
    .single()

  role = profile?.role || user.user_metadata?.role || 'staff'
  plantId = profile?.plant_id || user.app_metadata?.plant_id
  fullName = profile?.full_name || fullName

  const isExec = isSystemExecutive(role)
  const isAdmin = checkIsAdmin(role)
  const isWorker = !isExec && !isAdmin

  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  // Parallel Fetch
  const [
    { data: staffUsers },
    { data: attendanceLogs },
    { data: myAttendance }
  ] = await Promise.all([
    plantId
      ? supabase.from('users').select('id, full_name, role').eq('plant_id', plantId).eq('approval_status', 'approved')
      : Promise.resolve({ data: [] }),
    plantId
      ? supabase
          .from('attendance')
          .select('id, user_id, status, created_at, check_out_time, distance_from_plant_meters, users(full_name, role)')
          .eq('plant_id', plantId)
          .gte('created_at', `${todayDate}T00:00:00+05:30`)
          .lt('created_at', `${todayDate}T23:59:59+05:30`)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from('attendance')
      .select('status, created_at, check_out_time')
      .eq('user_id', user.id)
      .gte('created_at', `${todayDate}T00:00:00+05:30`)
      .lt('created_at', `${todayDate}T23:59:59+05:30`)
      .limit(1)
      .single()
  ])

  const totalStaff = staffUsers?.length || 0
  const logs = attendanceLogs || []
  const presentCount = logs.filter((l: any) => l.status === 'present').length
  const outOfRangeCount = logs.filter((l: any) => l.status === 'rejected_out_of_range').length
  const absentCount = Math.max(0, totalStaff - presentCount)
  const attendanceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0

  const todayStatus = (myAttendance as any)?.status as 'present' | 'rejected_out_of_range' | null
  const checkInTime = (myAttendance as any)?.created_at
    ? new Date((myAttendance as any).created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : undefined
  const checkOutTime = (myAttendance as any)?.check_out_time
    ? new Date((myAttendance as any).check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : undefined

  return (
    <div className="space-y-6 text-foreground animate-in fade-in duration-300">
      <PageHeader
        title={isExec ? "Attendance Performance & Logs" : "Staff Attendance"}
        description={
          isExec
            ? "Facility-wide attendance verification, geofenced status, and live shift tracking."
            : isAdmin
            ? "Monitor daily shifts, clock-ins, and staff availability."
            : "Manage your daily shifts and view your verified attendance logs."
        }
        showBackButton={true}
      />

      {/* ── WORKER VIEW: Clock in/out widget ── */}
      {isWorker && (
        <div className="mb-6">
          <AttendanceWidget todayStatus={todayStatus} checkInTime={checkInTime} checkOutTime={checkOutTime} />
        </div>
      )}

      {/* ── EXECUTIVE & ADMIN OVERVIEW STATS ── */}
      {(isExec || isAdmin) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <GlassCard className="p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Staff</span>
              <Users size={16} className="text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-foreground">{totalStaff}</span>
              <span className="text-xs font-bold text-muted-foreground px-2.5 py-0.5 bg-muted rounded-full">Roster</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Present Today</span>
              <CheckCircle size={16} className="text-success" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-success">{presentCount}</span>
              <span className="text-xs font-bold text-success px-2.5 py-0.5 bg-success/10 border border-success/20 rounded-full">{attendanceRate}%</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Absent</span>
              <XCircle size={16} className="text-danger" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-danger">{absentCount}</span>
              <span className="text-xs font-bold text-danger px-2.5 py-0.5 bg-danger/10 border border-danger/20 rounded-full">Unmarked</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Out of Range</span>
              <AlertTriangle size={16} className="text-warning" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-mono font-extrabold text-warning">{outOfRangeCount}</span>
              <span className="text-xs font-bold text-warning px-2.5 py-0.5 bg-warning/10 border border-warning/20 rounded-full">Rejected</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── ATTENDANCE LOGS TABLE ── */}
      <GlassCard className="overflow-hidden !p-0 rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <h3 className="font-heading font-bold text-sm text-foreground">
              {isExec || isAdmin ? "Today's Verified Attendance Records" : "My Attendance Activity"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Geofence perimeter timestamp log for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            {logs.length} Total Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/60 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Staff Member</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Check In</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Check Out</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Perimeter Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    No attendance events logged for today yet.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => {
                  const isPresent = log.status === 'present'
                  const staffName = log.users?.full_name || 'Staff Member'
                  const staffRole = log.users?.role || 'Staff'

                  return (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {staffName}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground capitalize">
                        {staffRole.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">
                        {new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {log.check_out_time
                          ? new Date(log.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                          : '--'}
                      </td>
                      <td className="px-6 py-4">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            {log.check_out_time ? 'Completed' : 'On Duty'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                            Out of Range
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {log.distance_from_plant_meters ? `${log.distance_from_plant_meters}m from plant` : 'In Geofence'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

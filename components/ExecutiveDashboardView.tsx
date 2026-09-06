'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GlassCard from '@/components/ui/GlassCard'
import StatusPill from '@/components/ui/StatusPill'
import {
  CheckSquare,
  AlertCircle,
  Users,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Activity,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

interface ExecutiveDashboardProps {
  metrics: {
    tasks: {
      total: number
      completed: number
      pending: number
      overdue: number
      completionRate: number
    }
    complaints: {
      total: number
      open: number
      inProgress: number
      resolved: number
      resolutionRate: number
      avgResolutionMinutes: number
    }
    staff: {
      total: number
      onDuty: number
      offDuty: number
      housekeeping: number
      management: number
      pendingApprovals: number
    }
    attendance: {
      totalStaff: number
      present: number
      absent: number
      outOfRange: number
      attendanceRate: number
      todayLogs: Array<{
        id: string
        userName: string
        userRole: string
        status: string
        checkIn: string
        checkOut: string | null
        distance: number
      }>
    }
    conference: {
      totalRooms: number
      availableRooms: number
      occupiedRooms: number
      todayBookingsCount: number
      utilizationRate: number
    }
    trends: {
      dailyStats: Array<{
        date: string
        name: string
        completions: number
        complaints: number
      }>
    }
  }
  notices: any[]
}

export default function ExecutiveDashboardView({ metrics, notices }: ExecutiveDashboardProps) {
  const { tasks, complaints, staff, attendance, conference, trends } = metrics

  return (
    <div className="space-y-8 text-foreground animate-in fade-in duration-300">
      
      {/* ── 1. EXECUTIVE KPI MATRIX ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* CARD 1: Task Performance */}
        <GlassCard interactive className="p-6 flex flex-col justify-between rounded-2xl border border-border hover:border-primary/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <CheckSquare size={18} />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-tight">Task Performance</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {tasks.completionRate}% Done
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{tasks.total}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{tasks.completed}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{tasks.pending}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Overdue</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{tasks.overdue}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-1">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${tasks.completionRate}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Daily Operations Status</span>
            <Link href="/portal/tasks" className="text-primary hover:underline flex items-center gap-1 group">
              View Tasks <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>

        {/* CARD 2: Complaint Performance */}
        <GlassCard interactive className="p-6 flex flex-col justify-between rounded-2xl border border-border hover:border-primary/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <AlertCircle size={18} />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-tight">Complaints & Issues</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {complaints.resolutionRate}% Resolved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Filed</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{complaints.total}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Open</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{complaints.open}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{complaints.inProgress}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{complaints.resolved}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl text-xs font-medium border border-border mb-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock size={14} /> Avg Resolution Time
              </span>
              <span className="font-mono font-bold text-foreground">
                {complaints.avgResolutionMinutes > 0 ? `${complaints.avgResolutionMinutes} mins` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Accountability Log</span>
            <Link href="/portal/complaints" className="text-primary hover:underline flex items-center gap-1 group">
              View Complaints <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>

        {/* CARD 3: Staff & Roster Overview */}
        <GlassCard interactive className="p-6 flex flex-col justify-between rounded-2xl border border-border hover:border-primary/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Users size={18} />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-tight">Staff & Workforce</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {staff.total} Total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <UserCheck size={12} /> On Duty
                </p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{staff.onDuty}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <UserX size={12} /> Off Duty
                </p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{staff.offDuty}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Housekeeping</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{staff.housekeeping}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Appr.</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{staff.pendingApprovals}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl text-xs font-medium border border-border mb-1">
              <span className="text-muted-foreground">Shift Active Coverage</span>
              <span className="font-mono font-bold text-foreground">
                {staff.total > 0 ? Math.round((staff.onDuty / staff.total) * 100) : 0}% Active
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Facility Directory</span>
            <Link href="/portal/staff" className="text-primary hover:underline flex items-center gap-1 group">
              View Staff <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>

        {/* CARD 4: Attendance & Time Logs */}
        <GlassCard interactive className="p-6 flex flex-col justify-between rounded-2xl border border-border hover:border-primary/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <ClipboardCheck size={18} />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-tight">Attendance Today</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {attendance.attendanceRate}% Present
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Present</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{attendance.present}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Absent</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{attendance.absent}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Out Range</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{attendance.outOfRange}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-1">
              Geofenced check-in log records for today's operational shifts.
            </p>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Shift Verification</span>
            <Link href="/portal/attendance" className="text-primary hover:underline flex items-center gap-1 group">
              View Logs <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>

        {/* CARD 5: Conference Rooms Utilization */}
        <GlassCard interactive className="p-6 flex flex-col justify-between rounded-2xl border border-border hover:border-primary/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Calendar size={18} />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-tight">Conference Rooms</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {conference.utilizationRate}% Utilized
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{conference.totalRooms}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Available</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{conference.availableRooms}</p>
              </div>
              <div className="p-3 bg-muted/60 rounded-xl border border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied</p>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-0.5">{conference.occupiedRooms}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl text-xs font-medium border border-border mb-1">
              <span className="text-muted-foreground">Today's Bookings</span>
              <span className="font-mono font-bold text-foreground">{conference.todayBookingsCount} Scheduled</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Timeline Schedule</span>
            <Link href="/portal/conference" className="text-primary hover:underline flex items-center gap-1 group">
              View Schedule <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>

        {/* CARD 6: Executive Analytics Summary */}
        <GlassCard interactive className="p-6 flex flex-col justify-between rounded-2xl border border-border hover:border-primary/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <TrendingUp size={18} />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-tight">Executive Analytics</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                7-Day Trend
              </span>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-xl border border-border">
                <span className="text-xs text-muted-foreground font-medium">Task Velocity (7d)</span>
                <span className="font-mono font-extrabold text-foreground text-sm">
                  {trends.dailyStats.reduce((sum, d) => sum + d.completions, 0)} completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-xl border border-border">
                <span className="text-xs text-muted-foreground font-medium">Issue Velocity (7d)</span>
                <span className="font-mono font-extrabold text-foreground text-sm">
                  {trends.dailyStats.reduce((sum, d) => sum + d.complaints, 0)} logged
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-1">
              Historical operational throughput and performance breakdowns.
            </p>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">In-Depth Reports</span>
            <Link href="/portal/analytics" className="text-primary hover:underline flex items-center gap-1 group">
              View Analytics <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>

      </div>

      {/* ── 2. OPERATIONAL TRENDS & ACTIVITY CHARTS ────────────────── */}
      <GlassCard className="p-6 md:p-8 rounded-2xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground tracking-tight">
              Operational Throughput (Last 7 Days)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparison between daily completed checklist tasks and reported issues.
            </p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="completions" name="Completed Tasks" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="complaints" name="Logged Complaints" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* ── 3. LIVE SHIFT ATTENDANCE LOG (READ ONLY) ────────────────── */}
      <GlassCard className="overflow-hidden !p-0 rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <h3 className="font-heading font-bold text-sm text-foreground">Recent Shift Attendance Records</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live clock-in events and verification status</p>
          </div>
          <Link href="/portal/attendance" className="text-xs font-semibold text-primary hover:underline">
            View All ({attendance.totalStaff}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/60 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Staff Member</th>
                <th className="px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Check In</th>
                <th className="px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Check Out</th>
                <th className="px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendance.todayLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-muted-foreground">
                    No attendance records logged for today yet.
                  </td>
                </tr>
              ) : (
                attendance.todayLogs.map((log) => {
                  const isPresent = log.status === 'present'
                  return (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-foreground">
                        {log.userName}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-muted-foreground capitalize">
                        {log.userRole.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-foreground">
                        {log.checkIn}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.checkOut || '--'}
                      </td>
                      <td className="px-6 py-3.5">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            {log.checkOut ? 'Completed' : 'On Duty'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger">
                            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                            Out of Range
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.distance}m
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ── 4. NOTICEBOARD (READ ONLY) ──────────────────────────────── */}
      <GlassCard className="overflow-hidden !p-0 rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <h3 className="font-heading font-bold text-sm text-foreground">Digital Noticeboard</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Facility announcements and bulletins</p>
          </div>
          <span className="text-xs font-bold text-muted-foreground font-mono">
            {notices.length} {notices.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {notices.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs text-muted-foreground font-medium">
              No active announcements currently posted.
            </div>
          ) : (
            notices.map((notice: any) => (
              <div
                key={notice.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-full"
              >
                {notice.image_url && (
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted mb-3">
                    <Image
                      src={notice.image_url}
                      alt={notice.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-foreground">{notice.title}</h4>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {notice.content ?? notice.details}
                  </p>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-3 pt-3 border-t border-border">
                  {notice.author_name ? `${notice.author_name} · ` : ''}
                  {new Date(notice.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </GlassCard>

    </div>
  )
}

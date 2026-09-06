'use client'

import React, { useState, useMemo } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import { CheckCircle2, Clock, AlertTriangle, Search, ShieldCheck } from 'lucide-react'

interface ExecutiveTaskPerformanceProps {
  tasks: Array<{
    id: string
    title: string
    frequency: string
    day_of_week: number | null
    target_date: string | null
    isCompleted: boolean
    completedByName: string | null
    created_at?: string
  }>
}

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ExecutiveTaskPerformanceView({ tasks }: ExecutiveTaskPerformanceProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // ── Metrics Calculation ──
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const pendingTasks = Math.max(0, totalTasks - completedTasks)
  
  // Overdue calculation: one-off tasks whose target_date is in the past and not completed
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  const overdueTasks = tasks.filter(t => !t.isCompleted && t.frequency === 'one-off' && t.target_date && t.target_date < todayStr).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // ── Search & Filter ──
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const isOverdue = !task.isCompleted && task.frequency === 'one-off' && task.target_date && task.target_date < todayStr
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.completedByName && task.completedByName.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      if (filter === 'completed') return task.isCompleted
      if (filter === 'pending') return !task.isCompleted
      if (filter === 'overdue') return isOverdue
      return true
    })
  }, [tasks, filter, searchTerm, todayStr])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ── Executive Oversight Banner ── */}
      <div className="flex items-center justify-between p-4 bg-muted/60 border border-border rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Executive Task Performance Audit</h4>
            <p className="text-xs text-muted-foreground">Authoritative read-only overview of facility execution and completion velocity.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full">
          Read-Only Mode
        </span>
      </div>

      {/* ── Top 5 Metrics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Tasks */}
        <GlassCard className="p-5 rounded-2xl border border-border flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-mono font-extrabold text-foreground">{totalTasks}</span>
            <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-md">Scheduled</span>
          </div>
        </GlassCard>

        {/* Completed */}
        <GlassCard className="p-5 rounded-2xl border border-border flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-mono font-extrabold text-success">{completedTasks}</span>
            <span className="text-xs font-bold text-success px-2 py-0.5 bg-success/10 border border-success/20 rounded-md">Verified</span>
          </div>
        </GlassCard>

        {/* Pending */}
        <GlassCard className="p-5 rounded-2xl border border-border flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-mono font-extrabold text-warning">{pendingTasks}</span>
            <span className="text-xs font-bold text-warning px-2 py-0.5 bg-warning/10 border border-warning/20 rounded-md">In Progress</span>
          </div>
        </GlassCard>

        {/* Overdue */}
        <GlassCard className="p-5 rounded-2xl border border-border flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue</p>
          <div className="flex items-baseline justify-between mt-3">
            <span className={`text-3xl font-mono font-extrabold ${overdueTasks > 0 ? 'text-danger' : 'text-foreground'}`}>
              {overdueTasks}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${overdueTasks > 0 ? 'text-danger bg-danger/10 border border-danger/20' : 'text-muted-foreground bg-muted'}`}>
              Delayed
            </span>
          </div>
        </GlassCard>

        {/* Completion Rate */}
        <GlassCard className="p-5 rounded-2xl border border-border flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion Rate</p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-mono font-extrabold text-primary">{completionRate}%</span>
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md">Throughput</span>
          </div>
        </GlassCard>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-muted/60 p-1.5 rounded-xl border border-border overflow-x-auto">
          {(['all', 'completed', 'pending', 'overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? `All (${totalTasks})` : tab === 'completed' ? `Completed (${completedTasks})` : tab === 'pending' ? `Pending (${pendingTasks})` : `Overdue (${overdueTasks})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* ── Read-Only Performance Table: Task | Assigned To | Due | Priority | Status ── */}
      <GlassCard className="overflow-hidden !p-0 rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <h3 className="font-heading font-bold text-sm text-foreground">Task Performance Registry</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Authoritative facility task metrics — No operational controls</p>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            Showing {filteredTasks.length} of {totalTasks}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/60 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Assigned To</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Due</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    No tasks match your filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isHighPriority = task.title.toLowerCase().includes('urgent') || 
                                         task.title.toLowerCase().includes('repair') || 
                                         task.title.toLowerCase().includes('emergency')
                  const isOverdue = !task.isCompleted && task.frequency === 'one-off' && task.target_date && task.target_date < todayStr

                  const dueText = task.frequency === 'weekly' && task.day_of_week !== null
                    ? `Every ${DOW_NAMES[task.day_of_week] || 'Week'}`
                    : task.frequency === 'one-off' && task.target_date
                    ? task.target_date
                    : 'End of Shift (Daily)'

                  return (
                    <tr key={task.id} className="hover:bg-muted/40 transition-colors">
                      {/* Task */}
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${task.isCompleted ? 'bg-success' : isOverdue ? 'bg-danger' : 'bg-warning'}`} />
                          <span>{task.title}</span>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        {task.isCompleted ? (
                          <span className="font-semibold text-foreground">{task.completedByName || 'On-Duty Staff'}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Housekeeping / Staff</span>
                        )}
                      </td>

                      {/* Due */}
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {dueText}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                          isHighPriority 
                            ? 'bg-danger/10 text-danger border-danger/30' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {isHighPriority ? 'High' : 'Routine'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {task.isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                            <AlertTriangle size={13} /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                            <Clock size={13} /> Pending
                          </span>
                        )}
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

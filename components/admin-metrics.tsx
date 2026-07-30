// @ts-nocheck
import { createClient } from '@/lib/supabase/server'

export default async function AdminMetrics() {
  const supabase = await createClient()

  // Fetch all complaints to calculate open vs resolved
  const { data: complaints } = await supabase.from('complaints').select('status')
  
  const openComplaints = complaints?.filter((c) => c.status !== 'resolved').length || 0
  const resolvedComplaints = complaints?.filter((c) => c.status === 'resolved').length || 0

  // Fetch total active notices
  const { count: totalNotices } = await supabase
    .from('notices')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="mb-10 grid gap-5 sm:grid-cols-3">
      {/* Card 1: Open Complaints */}
      <div className="bg-white dark:bg-bg-surface border border-black/5 dark:border-white/10 rounded-[14px] p-6 transition-all hover:bg-black/5 dark:hover:bg-bg-surface-raised shadow-sm dark:shadow-none">
        <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Action Required</p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-primary dark:text-text-primary">{openComplaints}</p>
        <p className="mt-1 text-xs font-medium text-muted dark:text-text-muted">Open Complaints</p>
      </div>
      
      {/* Card 2: Resolved Complaints */}
      <div className="bg-white dark:bg-bg-surface border border-black/5 dark:border-white/10 rounded-[14px] p-6 transition-all hover:bg-black/5 dark:hover:bg-bg-surface-raised shadow-sm dark:shadow-none">
        <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Completed</p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-primary dark:text-text-primary">{resolvedComplaints}</p>
        <p className="mt-1 text-xs font-medium text-muted dark:text-text-muted">Resolved Complaints</p>
      </div>

      {/* Card 3: Active Notices */}
      <div className="bg-white dark:bg-bg-surface border border-black/5 dark:border-white/10 rounded-[14px] p-6 transition-all hover:bg-black/5 dark:hover:bg-bg-surface-raised shadow-sm dark:shadow-none">
        <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted dark:text-text-muted">Broadcasts</p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-primary dark:text-text-primary">{totalNotices || 0}</p>
        <p className="mt-1 text-xs font-medium text-muted dark:text-text-muted">Active Notices</p>
      </div>
    </div>
  )
}
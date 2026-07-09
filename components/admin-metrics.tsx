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
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/70">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Action Required</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-red-600 dark:text-red-400">{openComplaints}</p>
        <p className="mt-1 text-xs font-medium text-neutral-400">Open Complaints</p>
      </div>
      
      {/* Card 2: Resolved Complaints */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/70">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Completed</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">{resolvedComplaints}</p>
        <p className="mt-1 text-xs font-medium text-neutral-400">Resolved Complaints</p>
      </div>

      {/* Card 3: Active Notices */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/70">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Broadcasts</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">{totalNotices || 0}</p>
        <p className="mt-1 text-xs font-medium text-neutral-400">Active Notices</p>
      </div>
    </div>
  )
}
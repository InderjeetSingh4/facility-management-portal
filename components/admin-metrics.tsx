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
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
        <p className="text-sm font-medium text-secondary">Action Required</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-danger">{openComplaints}</p>
        <p className="mt-1 text-xs font-medium text-muted">Open Complaints</p>
      </div>
      
      {/* Card 2: Resolved Complaints */}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
        <p className="text-sm font-medium text-secondary">Completed</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-success">{resolvedComplaints}</p>
        <p className="mt-1 text-xs font-medium text-muted">Resolved Complaints</p>
      </div>

      {/* Card 3: Active Notices */}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-surface-solid/50">
        <p className="text-sm font-medium text-secondary">Broadcasts</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-primary">{totalNotices || 0}</p>
        <p className="mt-1 text-xs font-medium text-muted">Active Notices</p>
      </div>
    </div>
  )
}
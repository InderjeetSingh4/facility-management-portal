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
      <div className="bg-card border border-border rounded-[14px] p-6 transition-all hover:bg-muted shadow-sm">
        <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">Action Required</p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground">{openComplaints}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Open Complaints</p>
      </div>
      
      {/* Card 2: Resolved Complaints */}
      <div className="bg-card border border-border rounded-[14px] p-6 transition-all hover:bg-muted shadow-sm">
        <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">Completed</p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground">{resolvedComplaints}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Resolved Complaints</p>
      </div>

      {/* Card 3: Active Notices */}
      <div className="bg-card border border-border rounded-[14px] p-6 transition-all hover:bg-muted shadow-sm">
        <p className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">Broadcasts</p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground">{totalNotices || 0}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Active Notices</p>
      </div>
    </div>
  )
}
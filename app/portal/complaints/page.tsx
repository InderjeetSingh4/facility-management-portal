import { createClient } from '@/lib/supabase/server'
import { getComplaints } from '../actions'
import ComplaintForm from './ComplaintForm'
import ComplaintActions from './ComplaintActions'
import AuditTrail from './AuditTrail'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import SkeletonCard from '@/components/ui/SkeletonCard'
import StatusPill from '@/components/ui/StatusPill'
import GlassCard from '@/components/ui/GlassCard'

async function ComplaintsContent({ isAdmin }: { isAdmin: boolean }) {
  const complaints = await getComplaints()

  const newComplaints = complaints.filter(c => c.status === 'open')
  const inProgressComplaints = complaints.filter(c => c.status === 'pending_approval' || c.status === 'rejected')
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'approved')

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto">
      {/* ── Admin Submit Form ── */}
      {isAdmin && (
        <GlassCard className="p-7 border border-black/5 dark:border-white/10 rounded-[14px]">
          <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-text-primary mb-6 tracking-tight">Report a New Issue</h2>
          <ComplaintForm />
        </GlassCard>
      )}

      {/* ── Kanban Board ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <KanbanLane title="New" complaints={newComplaints} isAdmin={isAdmin} />
        <KanbanLane title="In Progress" complaints={inProgressComplaints} isAdmin={isAdmin} />
        <KanbanLane title="Resolved" complaints={resolvedComplaints} isAdmin={isAdmin} />
      </div>
    </div>
  )
}

function KanbanLane({ title, complaints, isAdmin }: { title: string, complaints: any[], isAdmin: boolean }) {
  return (
    <div className="flex flex-col bg-white dark:bg-bg-surface rounded-[14px] border border-black/5 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-slate-600 dark:text-neutral-400 tracking-wider uppercase">{title} ({complaints.length})</h3>
      </div>
      
      <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {complaints.length === 0 ? (
           <div className="p-8 text-center">
             <p className="text-[13px] font-medium text-slate-500 dark:text-text-muted">No complaints in this lane.</p>
           </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.id} className="p-5 flex flex-col gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200">
              <div className="flex justify-between items-start gap-3">
                 <h4 className={`font-semibold text-sm leading-snug ${complaint.status === 'approved' ? 'line-through text-slate-400 dark:text-text-muted' : 'text-slate-900 dark:text-text-primary'}`}>
                   {complaint.title}
                 </h4>
                 <div className="flex-shrink-0">
                   <StatusPill status={complaint.status} />
                 </div>
              </div>
              
              <p className="text-[13px] text-slate-600 dark:text-text-muted line-clamp-2 leading-relaxed">
                {complaint.description}
              </p>
              
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-black/5 dark:border-white/10">
                <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-text-muted uppercase tracking-wider">
                   {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                {complaint.reportedBy && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-text-muted truncate max-w-[120px]">
                    By {complaint.reportedBy}
                  </span>
                )}
              </div>
              
              {complaint.status !== 'approved' && (
                <div className="mt-2">
                  <ComplaintActions complaintId={complaint.id} status={complaint.status} isAdmin={isAdmin} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ComplaintsSkeleton({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto">
      {isAdmin && <SkeletonCard lines={4} />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  )
}

export default async function ComplaintsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const role = user?.user_metadata?.role || 'staff'
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints & Accountability"
        description={isAdmin
          ? 'Report maintenance issues, review worker fixes, and approve or reject resolutions.'
          : 'View issues, submit fixes for manager approval, and track accountability.'}
        showBackButton={true}
      />

      <Suspense fallback={<ComplaintsSkeleton isAdmin={isAdmin} />}>
        <ComplaintsContent isAdmin={isAdmin} />
      </Suspense>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { getComplaints } from '../actions'
import ComplaintForm from './ComplaintForm'
import ComplaintActions from './ComplaintActions'
import ComplaintPhoto from './ComplaintPhoto'
import AuditTrail from './AuditTrail'
import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import SkeletonCard from '@/components/ui/SkeletonCard'
import StatusPill from '@/components/ui/StatusPill'
import GlassCard from '@/components/ui/GlassCard'
import { isSystemExecutive, isAdmin as checkIsAdmin } from '@/lib/auth/rbac'
import { AlertCircle, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

async function ComplaintsContent({ isAdmin, isExecutive }: { isAdmin: boolean; isExecutive: boolean }) {
  const complaints = await getComplaints()

  const newComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'open' || c.status === 'new' || !c.status)
  const inProgressComplaints = complaints.filter(c => c.status === 'reviewed' || c.status === 'pending_approval')
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'approved' || c.status === 'dismissed' || c.status === 'rejected')

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Executive Top Summary ── */}
      {isExecutive && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4 rounded-2xl border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Complaints</p>
            <p className="text-2xl font-mono font-extrabold text-foreground mt-1">{complaints.length}</p>
          </GlassCard>
          <GlassCard className="p-4 rounded-2xl border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Open Issues</p>
            <p className="text-2xl font-mono font-extrabold text-danger mt-1">{newComplaints.length}</p>
          </GlassCard>
          <GlassCard className="p-4 rounded-2xl border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-mono font-extrabold text-warning mt-1">{inProgressComplaints.length}</p>
          </GlassCard>
          <GlassCard className="p-4 rounded-2xl border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-mono font-extrabold text-success mt-1">{resolvedComplaints.length}</p>
          </GlassCard>
        </div>
      )}

      {/* ── Admin Submit Form (Hidden for Executives) ── */}
      {isAdmin && !isExecutive && (
        <GlassCard className="p-5 sm:p-6 md:p-8 border border-border rounded-2xl">
          <h2 className="text-lg md:text-xl font-heading font-bold text-foreground mb-5 tracking-tight">Report a New Issue</h2>
          <ComplaintForm />
        </GlassCard>
      )}

      {/* ── Kanban Board ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <KanbanLane title="New / Open" complaints={newComplaints} isAdmin={isAdmin} isExecutive={isExecutive} />
        <KanbanLane title="In Progress / Review" complaints={inProgressComplaints} isAdmin={isAdmin} isExecutive={isExecutive} />
        <KanbanLane title="Resolved / Closed" complaints={resolvedComplaints} isAdmin={isAdmin} isExecutive={isExecutive} />
      </div>
    </div>
  )
}

function KanbanLane({
  title,
  complaints,
  isAdmin,
  isExecutive,
}: {
  title: string
  complaints: any[]
  isAdmin: boolean
  isExecutive: boolean
}) {
  return (
    <div className="flex flex-col bg-card rounded-[14px] border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">{title} ({complaints.length})</h3>
      </div>
      
      <div className="flex flex-col divide-y divide-border">
        {complaints.length === 0 ? (
           <div className="p-6 text-center">
             <p className="text-xs font-medium text-muted-foreground">No complaints in this lane.</p>
           </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.id} className="p-4 flex flex-col gap-2.5 hover:bg-muted transition-colors duration-200">
              <div className="flex justify-between items-start gap-2">
                 <h4 className={`font-semibold text-xs sm:text-sm leading-snug ${complaint.status === 'approved' || complaint.status === 'resolved' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                   {complaint.title}
                 </h4>
                 <div className="flex-shrink-0">
                   <StatusPill status={complaint.status} />
                 </div>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {complaint.description}
              </p>

              {/* Photo Thumbnail */}
              {complaint.image_url && complaint.image_url.trim() !== '' && (
                <ComplaintPhoto src={complaint.image_url} alt={complaint.title} />
              )}
              
              <div className="flex justify-between items-center mt-1 pt-2.5 border-t border-border">
                <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                   {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                {complaint.reportedBy && (
                  <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[120px]">
                    By {complaint.reportedBy}
                  </span>
                )}
              </div>
              
              {!isExecutive && complaint.status !== 'approved' && complaint.status !== 'resolved' && (
                <div className="mt-1.5">
                  <ComplaintActions complaintId={complaint.id} status={complaint.status} isAdmin={isAdmin} isExecutive={isExecutive} />
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
    <div className="flex flex-col gap-6 w-full">
      {isAdmin && <SkeletonCard lines={4} />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  )
}

export default async function ComplaintsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'staff'
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || user.user_metadata?.role || 'staff'
  }

  const isExecutive = isSystemExecutive(role)
  const isAdmin = checkIsAdmin(role)

  return (
    <div className="space-y-6">
      <PageHeader
        title={isExecutive ? "Complaints Performance & Logs" : "Complaints & Accountability"}
        description={
          isExecutive
            ? 'Read-only maintenance accountability registry and resolution tracking.'
            : isAdmin
            ? 'Report maintenance issues, review worker fixes, and approve or reject resolutions.'
            : 'View issues, submit fixes for manager approval, and track accountability.'
        }
        showBackButton={true}
      />

      <Suspense fallback={<ComplaintsSkeleton isAdmin={isAdmin && !isExecutive} />}>
        <ComplaintsContent isAdmin={isAdmin} isExecutive={isExecutive} />
      </Suspense>
    </div>
  )
}

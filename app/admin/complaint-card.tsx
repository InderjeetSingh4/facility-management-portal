import type { ComplaintStatus } from '@/types/database'
import ResolveButton from './resolve-button'

interface ComplaintCardProps {
  complaint: {
    id: string
    title: string
    description: string
    image_url: string
    status: ComplaintStatus
    created_at: string
  }
}

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Open',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  open: 'bg-surface-muted/60 text-primary border border-border',
  pending_approval: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  rejected: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="overflow-hidden bg-surface backdrop-blur-2xl border border-border rounded-2xl shadow-xl active:scale-95 transition-all duration-200 cursor-pointer flex flex-col">
      <div className="relative h-44 w-full bg-surface-solid/60 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={complaint.image_url}
          alt={complaint.title}
          className="h-full w-full object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md ${STATUS_STYLES[complaint.status]}`}
        >
          {STATUS_LABELS[complaint.status]}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-primary">
            {complaint.title}
          </h2>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">
            {complaint.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-xs font-medium text-muted">{formattedDate}</p>
          {complaint.status !== 'approved' && (
            <div>
              <ResolveButton complaintId={complaint.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
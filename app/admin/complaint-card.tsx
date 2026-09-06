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
  pending: 'Pending',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  pending: 'bg-muted text-foreground border border-border',
  reviewed: 'bg-primary text-primary-foreground border-primary',
  resolved: 'bg-success-bg text-success border border-success-border',
  dismissed: 'bg-muted/60 text-foreground border border-border',
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="overflow-hidden bg-card backdrop-blur-2xl border border-border rounded-2xl shadow-xl active:scale-95 transition-all duration-200 cursor-pointer flex flex-col">
      <div className="relative h-44 w-full bg-muted/60 overflow-hidden">
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
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {complaint.title}
          </h2>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {complaint.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{formattedDate}</p>
          {complaint.status !== 'resolved' && (
            <div>
              <ResolveButton complaintId={complaint.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
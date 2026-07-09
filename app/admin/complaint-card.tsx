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

// Actual status values, per the schema we built in migration 003 — not the
// "Pending / In Progress / Resolved" wording from the spec, which was
// illustrative. Mapped to display labels below rather than inventing a
// status that doesn't exist in the database.
const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  reviewed: 'In Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  dismissed: 'bg-neutral-200 text-neutral-600',
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="relative h-44 w-full bg-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={complaint.image_url}
          alt={complaint.title}
          className="h-full w-full object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${STATUS_STYLES[complaint.status]}`}
        >
          {STATUS_LABELS[complaint.status]}
        </span>
      </div>

      <div className="p-5">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
          {complaint.title}
        </h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-neutral-500">
          {complaint.description}
        </p>
        <p className="mt-3 text-xs text-neutral-400">{formattedDate}</p>

        {complaint.status !== 'resolved' && (
          <div className="mt-4">
            <ResolveButton complaintId={complaint.id} />
          </div>
        )}
      </div>
    </article>
  )
}
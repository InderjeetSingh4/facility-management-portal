/**
 * StatusPill — Shared semantic status badge component.
 * Uses CSS tokens to handle light/dark mode inversion smoothly.
 */

interface StatusPillProps {
  status: string
  className?: string
}

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  switch (status) {
    case 'approved':
    case 'resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
          {status === 'resolved' ? 'Resolved' : 'Approved'}
        </span>
      )

    case 'pending_approval':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
          Pending Approval
        </span>
      )

    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-danger-border bg-danger-bg px-2.5 py-1 text-[11px] font-semibold text-danger ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-danger flex-shrink-0" />
          Rejected
        </span>
      )

    case 'open':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-pillBorder bg-neutral-pillBg px-2.5 py-1 text-[11px] font-semibold text-neutral-pillText ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-pillText flex-shrink-0" />
          Open
        </span>
      )
  }
}

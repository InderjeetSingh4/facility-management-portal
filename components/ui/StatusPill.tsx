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
          className={`inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-3 py-1 text-xs font-medium ${className}`}
        >
          Resolved
        </span>
      )

    case 'reviewed':
    case 'pending_approval':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
          Pending Approval
        </span>
      )

    case 'dismissed':
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-danger-border bg-danger-bg px-2.5 py-1 text-[11px] font-semibold text-danger ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-danger flex-shrink-0" />
          Rejected
        </span>
      )

    case 'pending':
    case 'open':
    default:
      return (
        <span
          className={`inline-flex items-center justify-center bg-muted border border-border text-foreground rounded-full px-3 py-1 text-xs font-medium ${className}`}
        >
          New
        </span>
      )
  }
}

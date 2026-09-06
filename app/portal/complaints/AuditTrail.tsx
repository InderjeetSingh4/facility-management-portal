import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

interface AuditTrailProps {
  reportedBy: string
  createdAt: string
  resolvedByName?: string | null
  resolvedAt?: string | null
  approvedByName?: string | null
  approvedAt?: string | null
  status: string
  rejectionNote?: string | null
}

export default function AuditTrail({
  reportedBy,
  createdAt,
  resolvedByName,
  resolvedAt,
  approvedByName,
  approvedAt,
  status,
  rejectionNote,
}: AuditTrailProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mt-4 border-t border-border pt-4 text-xs">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Audit Trail
      </p>

      <div className="space-y-2.5">
        {/* Step 1: Reported */}
        <div className="flex items-start gap-2.5 text-muted-foreground">
          <AlertCircle size={13} className="mt-0.5 text-muted flex-shrink-0" />
          <div>
            <span className="font-semibold text-foreground">{reportedBy}</span>
            {' '}reported issue
            <span className="ml-1.5 text-[10px] text-muted">{formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Step 2: Resolved by worker */}
        {resolvedByName && resolvedAt && (
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <Clock size={13} className="mt-0.5 text-warning flex-shrink-0" />
            <div>
              <span className="font-semibold text-foreground">{resolvedByName}</span>
              {' '}marked as fixed
              <span className="ml-1.5 text-[10px] text-muted">{formatDate(resolvedAt)}</span>
            </div>
          </div>
        )}

        {/* Step 3: Approved */}
        {status === 'approved' && approvedByName && approvedAt && (
          <div className="flex items-start gap-2.5 text-success">
            <CheckCircle2 size={13} className="mt-0.5 text-success flex-shrink-0" />
            <div>
              Approved by{' '}
              <span className="font-semibold text-foreground">{approvedByName}</span>
              <span className="ml-1.5 text-[10px] text-muted">{formatDate(approvedAt)}</span>
            </div>
          </div>
        )}

        {/* Step 3: Rejected */}
        {status === 'rejected' && approvedByName && approvedAt && (
          <div className="flex items-start gap-2.5 text-danger">
            <XCircle size={13} className="mt-0.5 text-danger flex-shrink-0" />
            <div>
              Rejected by{' '}
              <span className="font-semibold text-foreground">{approvedByName}</span>
              <span className="ml-1.5 text-[10px] text-muted">{formatDate(approvedAt)}</span>
              {rejectionNote && (
                <p className="mt-2 rounded-lg border border-danger bg-danger-bg px-3 py-2 text-[11px] italic text-danger">
                  "{rejectionNote}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

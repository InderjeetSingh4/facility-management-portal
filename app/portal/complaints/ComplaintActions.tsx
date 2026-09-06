'use client'

import { useState, useTransition } from 'react'
import { submitForApproval, approveComplaint, rejectComplaint } from '../actions'

interface ComplaintActionsProps {
  complaintId: string
  status: string
  isAdmin: boolean
  isExecutive?: boolean
}

export default function ComplaintActions({ complaintId, status, isAdmin, isExecutive = false }: ComplaintActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')

  const handleSubmitForApproval = () => {
    startTransition(async () => {
      await submitForApproval(complaintId)
    })
  }

  const handleApprove = () => {
    startTransition(async () => {
      await approveComplaint(complaintId)
    })
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await rejectComplaint(complaintId, rejectionNote)
      setShowRejectModal(false)
      setRejectionNote('')
    })
  }

  if (isExecutive || status === 'resolved' || status === 'approved') {
    return null
  }

  return (
    <div className="flex flex-col gap-2">

      {/* NEW / PENDING / OPEN — worker marks as fixed */}
      {(status === 'pending' || status === 'open' || status === 'new') && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmitForApproval}
          className="inline-flex w-full items-center justify-center gap-2 bg-muted hover:bg-primary hover:text-primary-foreground border border-border text-foreground transition-all rounded-lg py-2 px-4 text-sm active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Mark as Fixed (Request Approval)
            </>
          )}
        </button>
      )}

      {/* IN PROGRESS / REVIEWED / PENDING APPROVAL — admin sees approve / reject */}
      {(status === 'reviewed' || status === 'pending_approval') && (
        isAdmin ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleApprove}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-success px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-success/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowRejectModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-danger-border bg-card px-5 py-3 text-xs font-semibold text-danger shadow-sm hover:bg-danger-bg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        ) : (
          <div className="rounded-full border border-warning-border bg-warning-bg px-4 py-3 text-center text-xs font-semibold text-warning">
            ⏳ Waiting for Manager Approval
          </div>
        )
      )}

      {/* REJECT MODAL — scrim gets blur, panel stays solid */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-7 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Reject Resolution</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Provide feedback on why this fix was rejected.
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-5 space-y-4">
              <textarea
                required
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="e.g. Area is still dirty, pipe is still leaking..."
                rows={4}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm hover:bg-muted active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !rejectionNote.trim()}
                  className="rounded-full bg-danger text-danger-foreground px-6 py-2.5 text-xs font-semibold shadow-sm hover:bg-danger/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

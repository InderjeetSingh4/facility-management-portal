'use client'

import { useActionState } from 'react'
import { resolveComplaint, type ResolveComplaintState } from './actions'

const initialState: ResolveComplaintState = { error: null }

export default function ResolveButton({ complaintId }: { complaintId: string }) {
  const boundAction = resolveComplaint.bind(null, complaintId)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Updating…' : 'Mark Resolved'}
      </button>
      {state.error && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  )
}
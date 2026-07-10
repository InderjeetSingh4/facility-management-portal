'use client'

import { useTransition } from 'react'
import { resolveComplaint } from '../actions'

export default function ResolveButton({ complaintId }: { complaintId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => resolveComplaint(complaintId))}
      className={`
        inline-flex items-center gap-1.5 bg-accent text-accent-foreground rounded-2xl px-4 py-2 text-sm font-medium shadow-md transition-all hover:scale-105 hover:opacity-90 active:scale-95
        ${isPending ? 'opacity-60 scale-95' : ''}
      `}
    >
      {isPending ? (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {isPending ? 'Resolving…' : 'Mark Resolved'}
    </button>
  )
}

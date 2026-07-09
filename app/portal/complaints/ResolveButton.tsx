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
        inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60
        px-3.5 py-2 text-xs font-semibold text-emerald-700 backdrop-blur-sm
        transition-all hover:bg-emerald-100/80 hover:shadow-sm
        active:scale-95
        dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20
        ${isPending ? 'scale-95 opacity-60' : ''}
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

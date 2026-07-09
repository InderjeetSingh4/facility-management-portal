'use client'

import { useTransition } from 'react'
import { toggleTaskCompletion } from '../actions'

export default function TaskCheckbox({
  taskId,
  isCompleted,
}: {
  taskId: string
  isCompleted: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      id={`task-checkbox-${taskId}`}
      aria-pressed={isCompleted}
      aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      disabled={isPending}
      onClick={() => startTransition(() => toggleTaskCompletion(taskId))}
      className={`
        relative flex h-8 w-8 flex-shrink-0 items-center justify-center
        rounded-xl border-2 transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2
        ${
          isCompleted
            ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
            : 'border-neutral-300 bg-white/70 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-neutral-600 dark:bg-neutral-800/70 dark:hover:border-emerald-500/60'
        }
        ${isPending ? 'scale-90 opacity-60' : 'scale-100'}
      `}
    >
      {/* Spinner while pending */}
      {isPending && (
        <svg
          className="h-4 w-4 animate-spin text-neutral-400 dark:text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}

      {/* Checkmark */}
      {!isPending && isCompleted && (
        <svg
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
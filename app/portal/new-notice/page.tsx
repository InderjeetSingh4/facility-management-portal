'use client'

import { useActionState } from 'react'
import { createNotice } from '@/app/portal/actions'
import Link from 'next/link'

const initialState = { error: '' }

export default function NewNoticePage() {
  const [state, formAction, isPending] = useActionState(createNotice, initialState)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      
      {/* HEADER */}
      <header className="mb-10">
        <div className="mb-4">
          <Link href="/portal" className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Post an Announcement
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          This notice will be immediately visible to all staff on the main dashboard.
        </p>
      </header>

      {/* THE FORM (Glassmorphism) */}
      <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
        <form action={formAction} className="space-y-6">
          
          {/* TITLE INPUT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Notice Title</label>
            <input
              name="title"
              type="text"
              required
              disabled={isPending}
              placeholder="e.g., Elevator Maintenance"
              className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          {/* MESSAGE INPUT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Message Content</label>
            <textarea
              name="content"
              required
              rows={5}
              disabled={isPending}
              placeholder="Type your announcement here..."
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          {/* 📸 THE NEW IMAGE UPLOAD INPUT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Attach Image (Optional)</label>
            <input 
              name="image" 
              type="file" 
              accept="image/*" 
              disabled={isPending}
              className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-2 text-sm outline-none transition file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-neutral-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:file:bg-neutral-700 dark:file:text-neutral-200 dark:hover:file:bg-neutral-600"
            />
          </div>

          {/* ERROR HANDLING */}
          {state?.error && typeof state.error === 'string' && state.error !== '' && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Link 
              href="/portal"
              className="rounded-xl px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
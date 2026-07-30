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
          <Link href="/portal" className="text-sm font-medium text-secondary transition hover:text-primary">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Post an Announcement
        </h1>
        <p className="mt-2 text-secondary">
          This notice will be immediately visible to all staff on the main dashboard.
        </p>
      </header>

      {/* THE FORM */}
      <div className="rounded-3xl border border-border bg-surface shadow-surface p-8">
        <form action={formAction} className="space-y-6">
          
          {/* TITLE INPUT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Notice Title</label>
            <input
              name="title"
              type="text"
              required
              disabled={isPending}
              placeholder="e.g., Elevator Maintenance"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* MESSAGE INPUT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Message Content</label>
            <textarea
              name="content"
              required
              rows={5}
              disabled={isPending}
              placeholder="Type your announcement here..."
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* 📸 THE NEW IMAGE UPLOAD INPUT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Attach Image (Optional)</label>
            <input 
              name="image" 
              type="file" 
              accept="image/*" 
              disabled={isPending}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-primary outline-none transition file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-surface-muted file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-border/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* ERROR HANDLING */}
          {state?.error && typeof state.error === 'string' && state.error !== '' && (
            <div className="rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
              {state.error}
            </div>
          )}

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Link 
              href="/portal"
              className="rounded-xl px-4 py-3 text-sm font-medium text-secondary transition hover:bg-surface-muted"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:opacity-60"
            >
              {isPending ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
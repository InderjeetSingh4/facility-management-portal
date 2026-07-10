// @ts-nocheck
'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createNotice, type CreateNoticeState } from '@/app/admin/actions'
import { NOTICE_COLOR_THEMES } from '@/lib/notices/color-themes'

const initialState: CreateNoticeState = { error: null, success: false }

export default function AdminNoticeForm() {
  const [state, formAction, isPending] = useActionState(createNotice, initialState)
  const [showSuccess, setShowSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state.success) return

    formRef.current?.reset()
    setShowSuccess(true)
    const timeout = setTimeout(() => setShowSuccess(false), 3000)
    return () => clearTimeout(timeout)
  }, [state.success])

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-primary">
        Post a notice
      </h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="notice-title"
            className="mb-1.5 block text-xs font-medium text-secondary"
          >
            Title
          </label>
          <input
            id="notice-title"
            name="title"
            type="text"
            required
            disabled={isPending}
            placeholder="e.g. Fire Drill on Friday"
            className="w-full rounded-xl border border-border bg-surface-solid/50 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="notice-date"
            className="mb-1.5 block text-xs font-medium text-secondary"
          >
            Date
          </label>
          <input
            id="notice-date"
            name="date_string"
            type="text"
            required
            disabled={isPending}
            placeholder="e.g. July 10, 2026"
            className="w-full rounded-xl border border-border bg-surface-solid/50 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="notice-theme"
            className="mb-1.5 block text-xs font-medium text-secondary"
          >
            Theme
          </label>
          <select
            id="notice-theme"
            name="color_theme"
            required
            disabled={isPending}
            defaultValue=""
            className="w-full rounded-xl border border-border bg-surface-solid/50 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          >
            <option value="" disabled>
              Select a theme…
            </option>
            {NOTICE_COLOR_THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="notice-details"
            className="mb-1.5 block text-xs font-medium text-secondary"
          >
            Details
          </label>
          <textarea
            id="notice-details"
            name="details"
            required
            disabled={isPending}
            rows={3}
            placeholder="What do employees need to know?"
            className="w-full resize-none rounded-2xl border border-border bg-surface-solid/50 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          />
        </div>

        {/* NEW FILE INPUT FIELD FOR IMAGES */}
        <div>
          <label
            htmlFor="notice-image"
            className="mb-1.5 block text-xs font-medium text-secondary"
          >
            Attachment Image (Optional)
          </label>
          <input
            id="notice-image"
            name="image"
            type="file"
            accept="image/*"
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-surface-solid/50 px-4 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60 file:mr-4 file:rounded-full file:border-0 file:bg-surface-solid file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-secondary hover:file:bg-surface-solid/80 transition-colors cursor-pointer"
          />
        </div>

        {state.error && (
          <div
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700"
          >
            {state.error}
          </div>
        )}

        {showSuccess && (
          <div
            role="status"
            className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
          >
            Notice posted.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Posting…' : 'Post notice'}
        </button>
      </form>
    </div>
  )
}
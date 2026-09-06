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
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm backdrop-blur-xl">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-foreground">
        Post a notice
      </h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="notice-title"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
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
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="notice-date"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
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
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="notice-theme"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Theme
          </label>
          <select
            id="notice-theme"
            name="color_theme"
            required
            disabled={isPending}
            defaultValue=""
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
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
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
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
            className="w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>

        {/* NEW FILE INPUT FIELD FOR IMAGES */}
        <div>
          <label
            htmlFor="notice-image"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Attachment Image (Optional)
          </label>
          <input
            id="notice-image"
            name="image"
            type="file"
            accept="image/*"
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 file:mr-4 file:rounded-full file:border-0 file:bg-background file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-muted-foreground hover:file:bg-background/80 transition-colors cursor-pointer"
          />
        </div>

        {state.error && (
          <div
            role="alert"
            className="rounded-xl border border-danger-border bg-danger-bg px-4 py-2.5 text-sm text-danger"
          >
            {state.error}
          </div>
        )}

        {showSuccess && (
          <div
            role="status"
            className="rounded-xl border border-success-border bg-success-bg px-4 py-2.5 text-sm text-success"
          >
            Notice posted.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-primary/40 dark:bg-[image:var(--accent-gradient)] dark:shadow-[0_0_12px_var(--accent-glow)] px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
        >
          {isPending ? 'Posting…' : 'Post notice'}
        </button>
      </form>
    </div>
  )
}
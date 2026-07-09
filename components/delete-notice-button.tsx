'use client'

import { useTransition } from 'react'
import { deleteNotice } from '@/app/admin/actions'
import { toast } from 'sonner' // <-- Import toast

export default function DeleteNoticeButton({ noticeId, imageUrl }: { noticeId: string, imageUrl?: string | null }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (confirm('Are you sure you want to permanently delete this notice?')) {
          startTransition(async () => {
            const result = await deleteNotice(noticeId, imageUrl)
            if (result?.error) {
              toast.error(result.error) // Trigger error toast
            } else {
              toast.success('Notice deleted successfully!') // Trigger success toast
            }
          })
        }
      }}
      disabled={isPending}
      className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
'use client'

import { logOut } from '@/app/auth/actions'

export default function SignOutButton() {
  return (
    <button
      onClick={() => logOut()}
      className="text-sm font-medium text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
    >
      Sign Out
    </button>
  )
}
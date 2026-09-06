'use client'

import { logOut } from '@/app/auth/actions'

export default function SignOutButton() {
  return (
    <button
      onClick={() => logOut()}
      className="text-sm font-medium text-muted-foreground transition hover:text-danger"
    >
      Sign Out
    </button>
  )
}
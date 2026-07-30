import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import { ROLE_HOME } from '@/lib/auth/roles'

export default async function TasksLayout({ children }: { children: ReactNode }) {
  const profile = await getUserProfile()

  if (!profile) redirect('/login')
  if (profile.role !== 'cleaner') {
    redirect(ROLE_HOME[profile.role])
  }

  return <>{children}</>
}
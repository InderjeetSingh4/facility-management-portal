import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import { ROLE_HOME } from '@/lib/auth/roles'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getUserProfile()

  // 1. If they are not logged in at all, kick them to the login page
  if (!profile) {
    redirect('/login')
  }

  // 2. If they are logged in, but are NOT an admin, kick them to the regular portal
  if (profile.role !== 'super_admin' && profile.role !== 'local_admin') {
    redirect(ROLE_HOME[profile.role] || '/portal')
  }

  // 3. If they pass both checks, let them see the Admin interface!
  return <>{children}</>
}
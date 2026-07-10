import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalShell from '../../components/PortalShell'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch full_name, approval_status, and notifications_enabled from public.users
  let { data: profile, error } = await supabase
    .from('users')
    .select('full_name, approval_status, notifications_enabled')
    .eq('id', user.id)
    .single()

  // If it failed (likely because the migration for notifications_enabled hasn't been run), fallback
  if (error) {
    const fallback = await supabase
      .from('users')
      .select('full_name, approval_status')
      .eq('id', user.id)
      .single()
    profile = fallback.data as any
  }

  const approvalStatus = profile?.approval_status || user.app_metadata?.approval_status || 'pending'
  
  if (approvalStatus !== 'approved') {
    redirect('/pending-approval')
  }

  const role = user.user_metadata?.role || 'staff'
  const email = user.email || 'User'
  const fullName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0]
  
  const formattedRole = role.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
  const initial = fullName.charAt(0).toUpperCase()
  const isAdmin = role === 'local_admin' || role === 'super_admin'

  return (
    <PortalShell 
      email={email} 
      fullName={fullName}
      formattedRole={formattedRole} 
      initial={initial} 
      isAdmin={isAdmin}
      notificationsEnabled={profile?.notifications_enabled ?? null}
    >
      {children}
    </PortalShell>
  )
}
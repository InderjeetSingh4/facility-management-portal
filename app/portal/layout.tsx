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

  // Fetch full_name and approval_status from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, approval_status, notifications_enabled')
    .eq('id', user.id)
    .single()

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
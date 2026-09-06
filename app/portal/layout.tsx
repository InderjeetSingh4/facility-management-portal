import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalShell from '../../components/PortalShell'
import { isSystemExecutive, isAdmin, formatRoleName } from '@/lib/auth/rbac'

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

  // Fetch role, full_name, plant_id, approval_status, and notifications_enabled from public.users
  let { data: profile, error } = await supabase
    .from('users')
    .select('id, full_name, role, plant_id, approval_status, notifications_enabled')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    const fallback = await supabase
      .from('users')
      .select('id, full_name, role, plant_id, approval_status')
      .eq('id', user.id)
      .single()
    profile = fallback.data as any
  }

  const approvalStatus = profile?.approval_status || user.app_metadata?.approval_status || 'pending'
  
  if (approvalStatus !== 'approved') {
    redirect('/pending-approval')
  }

  const role = profile?.role || user.user_metadata?.role || 'staff'
  const email = user.email || 'User'
  const fullName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0]
  
  const formattedRole = formatRoleName(role)
  const initial = fullName.charAt(0).toUpperCase()
  const isExec = isSystemExecutive(role)
  const isAdm = isAdmin(role)

  return (
    <PortalShell 
      email={email} 
      fullName={fullName}
      formattedRole={formattedRole} 
      initial={initial} 
      isAdmin={isAdm}
      isExecutive={isExec}
      role={role}
      notificationsEnabled={profile?.notifications_enabled ?? null}
    >
      {children}
    </PortalShell>
  )
}
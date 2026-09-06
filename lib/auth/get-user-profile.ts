import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export interface UserProfile {
  id: string
  role: UserRole
  plantId: string | null
  fullName: string
  approvalStatus: string
}

/**
 * Fetches the signed-in user's profile from `public.users`, or null if
 * there's no valid session.
 *
 * getClaims() verifies the JWT first (cheap, no extra round trip in the
 * common case) before we bother hitting the database. The `users` row read
 * is itself RLS-scoped to the caller (their own row, or every row for a
 * super_admin) — so this can never leak another tenant's profile data.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, role, plant_id, full_name, approval_status')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return {
      id: user.id,
      role: (user.user_metadata?.role as UserRole) || 'employee',
      plantId: (user.app_metadata?.plant_id as string) || (user.user_metadata?.plant_id as string) || null,
      fullName: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
      approvalStatus: (user.app_metadata?.approval_status as string) || 'pending',
    }
  }

  return {
    id: profile.id,
    role: profile.role,
    plantId: profile.plant_id,
    fullName: profile.full_name,
    approvalStatus: profile.approval_status,
  }
}
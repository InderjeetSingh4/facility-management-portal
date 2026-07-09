import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export interface UserProfile {
  id: string
  role: UserRole
  plantId: string | null
  fullName: string
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

  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, role, plant_id, full_name')
    .eq('id', userId)
    .single()

  if (error || !profile) return null

  return {
    id: profile.id,
    role: profile.role,
    plantId: profile.plant_id,
    fullName: profile.full_name,
  }
}
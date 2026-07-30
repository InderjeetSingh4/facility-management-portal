import type { UserRole } from '@/types/database'

/**
 * Where each role lands after login. Both super_admin and local_admin share
 * the /admin section — what they can see once there is an RLS/UI concern,
 * not a routing one.
 */
export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: '/admin',
  local_admin: '/admin',
  cleaner: '/tasks',
  employee: '/portal',
}
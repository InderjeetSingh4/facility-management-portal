import { UserRole } from '@/types/database'

/**
 * System Executive is an oversight / management role.
 * Monitors performance, reads analytics and reports, but cannot perform operational mutations.
 */
export function isSystemExecutive(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim()
  return r === 'systemexecutive' || r === 'executive'
}

/**
 * Facility Manager / Company Admin has operational authority to manage tasks, complaints, staff, rooms, and attendance.
 */
export function isLocalAdmin(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim()
  if (r === 'systemexecutive' || r === 'executive') return false
  return r === 'localadmin' || r === 'admin' || r === 'facilitymanager' || r === 'manager'
}

/**
 * Platform Super Admin has top-level authority.
 */
export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim()
  return r === 'superadmin' || r === 'platformsuperadmin'
}

/**
 * Any administrative role (Super Admin or Facility Manager).
 */
export function isAdmin(role?: string | null): boolean {
  return isSuperAdmin(role) || isLocalAdmin(role)
}

/**
 * Operational Housekeeper / Cleaner role.
 */
export function isCleaner(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim()
  if (r === 'systemexecutive' || r === 'executive') return false
  return r === 'cleaner' || r === 'housekeeper'
}

/**
 * General staff / employee.
 */
export function isEmployee(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim()
  if (r === 'systemexecutive' || r === 'executive') return false
  return r === 'employee' || r === 'staff'
}

/**
 * Operational staff (Housekeeper, Cleaner, or Employee) who execute tasks or report issues.
 */
export function isStaff(role?: string | null): boolean {
  return isCleaner(role) || isEmployee(role)
}

/**
 * Permission check: Can manage operations (create tasks, approve complaints, manage staff, post notices).
 * Only Facility Manager and Platform Super Admin. (System Executive CANNOT).
 */
export function canManageOperations(role?: string | null): boolean {
  return isAdmin(role)
}

/**
 * Permission check: Can execute checklist tasks.
 * Cleaners, Housekeepers, and Facility Managers. (System Executive CANNOT).
 */
export function canExecuteTasks(role?: string | null): boolean {
  return isCleaner(role) || isLocalAdmin(role)
}

/**
 * Permission check: Can approve/reject staff registrations.
 * Only Facility Managers and Super Admins. (System Executive CANNOT).
 */
export function canApproveStaff(role?: string | null): boolean {
  return isAdmin(role)
}

/**
 * Permission check: Can book conference rooms.
 * Employees, Facility Managers, and Super Admins.
 */
export function canBookConferenceRooms(role?: string | null): boolean {
  return isEmployee(role) || isAdmin(role)
}

/**
 * Permission check: Can mark attendance (clock in/out).
 * Only operational field staff (Cleaners / Housekeepers / Employees).
 */
export function canMarkAttendance(role?: string | null): boolean {
  return isCleaner(role) || isEmployee(role)
}

/**
 * User-friendly formatted role name.
 */
export function formatRoleName(role?: string | null): string {
  if (!role) return 'Company Employee / Occupant'
  const r = role.toLowerCase().replace(/[-_ ]/g, '').trim()
  switch (r) {
    case 'superadmin':
    case 'platformsuperadmin':
      return 'Platform Super Admin'
    case 'systemexecutive':
    case 'executive':
      return 'System Executive'
    case 'localadmin':
    case 'facilitymanager':
    case 'admin':
      return 'Facility Manager'
    case 'housekeeper':
    case 'cleaner':
      return 'Housekeeper / Facility Staff'
    case 'employee':
    case 'staff':
      return 'Company Employee / Occupant'
    default:
      return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

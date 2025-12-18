import { Permission, Role, useAuth } from "@/store/auth"

import { AdminUser } from "@/types/admin"

/**
 * Check if a user has a specific role
 */
export function hasRole(
  user: AdminUser | null | undefined,
  roleName: string
): boolean {
  if (!user || !user.roles) return false
  return user.roles.some(
    (role) =>
      role.name === roleName ||
      role.name.toLowerCase() === roleName.toLowerCase()
  )
}

/**
 * Check if a user has multiple roles (any of them)
 */
export function hasAnyRole(
  user: AdminUser | null | undefined,
  roleNames: string[]
): boolean {
  if (!user || !user.roles) return false
  return user.roles.some((role) =>
    roleNames.some(
      (name) =>
        role.name === name || role.name.toLowerCase() === name.toLowerCase()
    )
  )
}

/**
 * Check if a user has all specified roles
 */
export function hasAllRoles(
  user: AdminUser | null | undefined,
  roleNames: string[]
): boolean {
  if (!user || !user.roles) return false
  return roleNames.every((name) =>
    user.roles.some(
      (role) =>
        role.name === name || role.name.toLowerCase() === name.toLowerCase()
    )
  )
}

/**
 * Check if a user has a specific permission
 */
export function can(
  user: AdminUser | null | undefined,
  permissionName: string
): boolean {
  if (!user) return false

  if (hasRole(user, "super_admin")) {
    return true
  }

  if (!user.roles) return false

  for (const role of user.roles) {
    if (role.permissions?.some((perm) => perm.name === permissionName)) {
      return true
    }
  }

  return false
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: AdminUser | null | undefined): boolean {
  return hasRole(user, "super_admin")
}

/**
 * Check if user is an admin (super admin or admin role)
 */
export function isAdmin(user: AdminUser | null | undefined): boolean {
  return hasAnyRole(user, ["super_admin", "admin"])
}

/**
 * Check if current user can manage the target user
 * Super admin can manage anyone, admin can manage non-admin users
 */
export function canManageUser(
  currentUser: AdminUser | null | undefined,
  targetUser: AdminUser | null | undefined
): boolean {
  if (!currentUser || !targetUser) return false

  const currentIsSuperAdmin = isSuperAdmin(currentUser)
  const targetIsSuperAdmin = isSuperAdmin(targetUser)
  const targetIsAdmin = isAdmin(targetUser)

  if (currentIsSuperAdmin) {
    return true
  }

  if (targetIsSuperAdmin) {
    return false
  }

  if (isAdmin(currentUser) && !targetIsAdmin) {
    return true
  }

  return false
}

/**
 * Check if current user can edit a role
 * Only super admin can edit built-in admin roles
 */
export function canEditRole(
  currentUser: AdminUser | null | undefined,
  roleName: string
): boolean {
  if (!currentUser) return false

  const builtInAdminRoles = [
    "super_admin",
    "admin",
    "finance",
    "events_manager",
    "content_editor",
  ]
  const isBuiltIn = builtInAdminRoles.includes(roleName)

  if (isBuiltIn) {
    return isSuperAdmin(currentUser)
  }

  return can(currentUser, "manage_roles")
}

/**
 * Check if current user can assign roles
 */
export function canAssignRoles(
  currentUser: AdminUser | null | undefined
): boolean {
  return can(currentUser, "assign_roles")
}

/**
 * Check if current user can delete a user
 */
export function canDeleteUser(
  currentUser: AdminUser | null | undefined,
  targetUser: AdminUser | null | undefined
): boolean {
  return canManageUser(currentUser, targetUser)
}

/**
 * Check if current user can view users
 */
export function canViewUsers(
  currentUser: AdminUser | null | undefined
): boolean {
  return can(currentUser, "view_all_users")
}

/**
 * Check if current user can manage permissions
 */
export function canManagePermissions(
  currentUser: AdminUser | null | undefined
): boolean {
  return can(currentUser, "manage_permissions")
}

/**
 * Check if current user can view data retention settings
 */
export function canViewRetention(
  currentUser: AdminUser | null | undefined
): boolean {
  return isSuperAdmin(currentUser)
}

/**
 * Check if current user can view audit logs
 */
export function canViewAuditLogs(
  currentUser: AdminUser | null | undefined
): boolean {
  return isAdmin(currentUser)
}

/**
 * Get all permissions for a user (either direct or through roles)
 */
export function getAllPermissions(
  user: AdminUser | null | undefined
): Permission[] {
  if (!user || !user.roles) return []

  const permissionsMap = new Map<string, Permission>()

  for (const role of user.roles) {
    if (role.permissions) {
      for (const perm of role.permissions) {
        permissionsMap.set(perm.id.toString(), perm)
      }
    }
  }

  return Array.from(permissionsMap.values())
}

/**
 * Get all role names for a user
 */
export function getRoleNames(user: AdminUser | null | undefined): string[] {
  if (!user || !user.roles) return []
  return user.roles.map((role) => role.name)
}

/**
 * Check if a role is a built-in role
 */
export function isBuiltInRole(roleName: string): boolean {
  const builtInRoles = [
    "super_admin",
    "admin",
    "finance",
    "events_manager",
    "content_editor",
    "member",
  ]
  return builtInRoles.includes(roleName.toLowerCase())
}

/**
 * Higher-order component / hook to protect pages based on role
 * Usage: if (!requireRole(useAuth().user, 'super_admin')) return <Unauthorized />;
 */
export function requireRole(
  user: AdminUser | null | undefined,
  roleName: string
): boolean {
  return hasRole(user, roleName)
}

/**
 * Higher-order component / hook to protect pages based on permission
 * Usage: if (!requirePermission(useAuth().user, 'manage_users')) return <Unauthorized />;
 */
export function requirePermission(
  user: AdminUser | null | undefined,
  permissionName: string
): boolean {
  return can(user, permissionName)
}

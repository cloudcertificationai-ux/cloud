import { AdminRole, Permission } from '@/types'

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: [
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'instructors:create',
    'instructors:read',
    'instructors:update',
    'instructors:delete',
    'students:create',
    'students:read',
    'students:update',
    'students:delete',
    'analytics:read',
    'settings:read',
    'settings:update',
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
  ],
  admin: [
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'instructors:create',
    'instructors:read',
    'instructors:update',
    'instructors:delete',
    'students:read',
    'students:update',
    'analytics:read',
    'settings:read',
    'settings:update',
  ],
  content_manager: [
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'instructors:read',
    'students:read',
    'analytics:read',
  ],
  instructor_manager: [
    'instructors:create',
    'instructors:read',
    'instructors:update',
    'instructors:delete',
    'courses:read',
    'students:read',
    'analytics:read',
  ],
  analytics_viewer: [
    'courses:read',
    'instructors:read',
    'students:read',
    'analytics:read',
  ],
}

export function hasPermission(userRole: AdminRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export function canAccessResource(userRole: AdminRole, resource: string, action: string): boolean {
  const permission = `${resource}:${action}`
  return hasPermission(userRole, permission)
}

export function filterMenuItems(userRole: AdminRole) {
  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', permission: 'analytics:read' },
    { name: 'Courses', href: '/admin/courses', permission: 'courses:read' },
    { name: 'Instructors', href: '/admin/instructors', permission: 'instructors:read' },
    { name: 'Students', href: '/admin/students', permission: 'students:read' },
    { name: 'Analytics', href: '/admin/analytics', permission: 'analytics:read' },
    { name: 'Settings', href: '/admin/settings', permission: 'settings:read' },
  ]

  return menuItems.filter(item => hasPermission(userRole, item.permission))
}

export function getRoleDisplayName(role: AdminRole): string {
  const roleNames: Record<AdminRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    content_manager: 'Content Manager',
    instructor_manager: 'Instructor Manager',
    analytics_viewer: 'Analytics Viewer',
  }
  return roleNames[role] || role
}

export function getRoleColor(role: AdminRole): string {
  const roleColors: Record<AdminRole, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    content_manager: 'bg-green-100 text-green-800',
    instructor_manager: 'bg-yellow-100 text-yellow-800',
    analytics_viewer: 'bg-gray-100 text-gray-800',
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}
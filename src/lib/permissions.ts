import type { PermissionGroupName, UserRole } from '@/types'

export const EventNestPermissions = {
  Events: {
    View: 'Events.View',
    Create: 'Events.Create',
    Edit: 'Events.Edit',
    Delete: 'Events.Delete',
  },
  Tags: {
    View: 'Tags.View',
    Create: 'Tags.Create',
    Edit: 'Tags.Edit',
    Delete: 'Tags.Delete',
  },
  RSVPs: {
    View: 'RSVPs.View',
    Create: 'RSVPs.Create',
    Edit: 'RSVPs.Edit',
    Manage: 'RSVPs.Manage',
    Cancel: 'RSVPs.Cancel',
  },
  Users: {
    View: 'Users.View',
    Manage: 'Users.Manage',
  },
} as const

export const ALL_PERMISSIONS: string[] = Object.values(EventNestPermissions).flatMap((group) =>
  Object.values(group),
)

export const PERMISSION_GROUPS: PermissionGroupName[] = ['Events', 'Tags', 'RSVPs', 'Users']

export const PERMISSION_LABELS: Record<string, string> = {
  'Events.View': 'View Events',
  'Events.Create': 'Create Events',
  'Events.Edit': 'Edit Events',
  'Events.Delete': 'Delete Events',
  'Tags.View': 'View Tags',
  'Tags.Create': 'Create Tags',
  'Tags.Edit': 'Edit Tags',
  'Tags.Delete': 'Delete Tags',
  'RSVPs.View': 'View RSVPs',
  'RSVPs.Create': 'Create RSVPs',
  'RSVPs.Edit': 'Edit RSVPs',
  'RSVPs.Manage': 'Manage RSVPs',
  'RSVPs.Cancel': 'Cancel RSVPs',
  'Users.View': 'View Users',
  'Users.Manage': 'Manage Users',
}

export const ROLE_DEFAULTS: Record<UserRole, string[]> = {
  User: ['Events.View', 'Tags.View', 'RSVPs.View', 'RSVPs.Create', 'RSVPs.Edit', 'RSVPs.Cancel'],
  Organizer: [
    'Events.View',
    'Tags.View',
    'RSVPs.View',
    'RSVPs.Create',
    'RSVPs.Edit',
    'RSVPs.Cancel',
    'Events.Create',
    'Events.Edit',
    'Tags.Create',
    'RSVPs.Manage',
  ],
  Moderator: [
    'Events.View',
    'Tags.View',
    'RSVPs.View',
    'RSVPs.Create',
    'RSVPs.Edit',
    'RSVPs.Cancel',
    'Events.Create',
    'Events.Edit',
    'Tags.Create',
    'RSVPs.Manage',
    'Users.View',
  ],
  Admin: [],
  SuperAdmin: [],
}

export const BUILT_IN_ROLE_NAMES = ['User', 'Organizer', 'Moderator', 'Admin', 'SuperAdmin']

export const ADMIN_ROLES: UserRole[] = ['Admin', 'SuperAdmin']

export const isAdminRole = (role?: UserRole): boolean => !!role && ADMIN_ROLES.includes(role)

export const isBuiltInRole = (roleName: string): boolean => BUILT_IN_ROLE_NAMES.includes(roleName)

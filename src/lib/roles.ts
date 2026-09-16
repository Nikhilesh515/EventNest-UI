const ROLE_BADGE_CLASSES: Record<string, string> = {
  user: 'badge--user',
  organizer: 'badge--organizer',
  moderator: 'badge--moderator',
  admin: 'badge--admin',
  superadmin: 'badge--superadmin',
};

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  user: 'User',
  organizer: 'Organizer',
  moderator: 'Moderator',
  admin: 'Admin',
  superadmin: 'Super Admin',
};

export function getRoleBadgeClass(roleName: string): string {
  return ROLE_BADGE_CLASSES[roleName.toLowerCase()] ?? 'badge--user';
}

export function getRoleDisplayName(roleName: string): string {
  return ROLE_DISPLAY_NAMES[roleName.toLowerCase()] ?? roleName;
}

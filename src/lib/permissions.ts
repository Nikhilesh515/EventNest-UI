import type { User } from '../types';

function getEffectiveRole(user: User | null | undefined): string {
  return (user?.role || user?.roleName || '').toLowerCase();
}

const ADMIN_ROLES = new Set(['admin', 'superadmin']);
const MODERATOR_ROLES = new Set(['moderator', 'admin', 'superadmin']);
const ORGANIZER_ROLES = new Set(['organizer', 'moderator', 'admin', 'superadmin']);

export function isAdmin(user: User | null | undefined): boolean {
  return ADMIN_ROLES.has(getEffectiveRole(user));
}

export function isModerator(user: User | null | undefined): boolean {
  return MODERATOR_ROLES.has(getEffectiveRole(user));
}

export function isOrganizer(user: User | null | undefined): boolean {
  return ORGANIZER_ROLES.has(getEffectiveRole(user));
}

export function hasRole(user: User | null | undefined, roles: string[]): boolean {
  if (!user) return false;
  const effective = getEffectiveRole(user);
  return roles.some((r) => r.toLowerCase() === effective);
}

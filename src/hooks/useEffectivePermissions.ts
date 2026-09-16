import { ALL_PERMISSIONS, PERMISSION_LABELS, ROLE_DEFAULTS } from '@/lib/permissions'
import type { EffectivePermission, PermissionGroupName, UserRole } from '@/types'

const GROUP_OF = (key: string): PermissionGroupName => key.split('.')[0] as PermissionGroupName
export { GROUP_OF }

export function computeEffective(
  role: UserRole | null,
  effectiveNames: Set<string>,
): EffectivePermission[] {
  const roleNames = new Set(role ? (ROLE_DEFAULTS[role] ?? []) : [])
  return ALL_PERMISSIONS.map((key) => {
    const roleHas = roleNames.has(key)
    const direct = effectiveNames.has(key)
    const source: EffectivePermission['source'] = direct
      ? roleHas
        ? 'role default'
        : 'direct grant'
      : roleHas
        ? 'role default'
        : '-'
    return { key, roleHas, effective: direct || roleHas, source, expiry: null, overridden: false }
  })
}

export function permissionLabel(key: string): string {
  return PERMISSION_LABELS[key] ?? key
}

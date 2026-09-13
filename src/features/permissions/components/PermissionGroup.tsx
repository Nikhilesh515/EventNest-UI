import type { EffectivePermission, PermissionGroupName } from '@/types'
import { PermissionRow } from './PermissionRow'

interface PermissionGroupProps {
  group: PermissionGroupName
  permissions: EffectivePermission[]
  busyKey: string | null
  onGrant(key: string, expiresAt?: string | null): void
  onRevoke(key: string): void
}

export function PermissionGroup({
  group,
  permissions,
  busyKey,
  onGrant,
  onRevoke,
}: PermissionGroupProps) {
  return (
    <section className="ledger-group" aria-labelledby={`perm-${group}`}>
      <h3 className="ledger-group__head" id={`perm-${group}`}>
        {group} ({permissions.length})
      </h3>
      {permissions.length === 0 ? (
        <p className="ledger-group__empty">No permissions in this group.</p>
      ) : null}
      {permissions.map((permission) => (
        <PermissionRow
          key={permission.key}
          permission={permission}
          busy={busyKey === permission.key}
          onGrant={(expiresAt) => onGrant(permission.key, expiresAt)}
          onRevoke={() => onRevoke(permission.key)}
        />
      ))}
    </section>
  )
}

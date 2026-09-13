import type { EffectivePermission, PermissionGroupName } from '@/types'
import { PERMISSION_GROUPS } from '@/lib/permissions'
import { PermissionGroup } from './PermissionGroup'

interface PermissionLedgerProps {
  permissions: EffectivePermission[]
  busyKey: string | null
  onGrant(key: string, expiresAt?: string | null): void
  onRevoke(key: string): void
}

export function PermissionLedger({
  permissions,
  busyKey,
  onGrant,
  onRevoke,
}: PermissionLedgerProps) {
  return (
    <div className="ledger">
      {PERMISSION_GROUPS.map((group: PermissionGroupName) => (
        <PermissionGroup
          key={group}
          group={group}
          permissions={permissions.filter((permission) => permission.key.startsWith(`${group}.`))}
          busyKey={busyKey}
          onGrant={onGrant}
          onRevoke={onRevoke}
        />
      ))}
    </div>
  )
}

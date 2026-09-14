import type { EffectivePermission, PermissionGroupName } from '@/types'
import { PERMISSION_GROUPS } from '@/lib/permissions'
import { PermissionGroup } from './PermissionGroup'

interface PermissionLedgerProps {
  permissions: EffectivePermission[]
  userName: string
  busyKey: string | null
  onGrant(key: string, expiresAt?: string | null): void
  onRevoke(key: string): void
}

export function PermissionLedger({
  permissions,
  userName,
  busyKey,
  onGrant,
  onRevoke,
}: PermissionLedgerProps) {
  return (
    <>
      <nav className="group-tabs" aria-label="Permission groups">
        {PERMISSION_GROUPS.map((group: PermissionGroupName) => (
          <a key={group} className="btn btn--ghost btn--sm" href={`#perm-${group.toLowerCase()}`}>
            {group}
          </a>
        ))}
      </nav>
      <div className="ledger">
        {PERMISSION_GROUPS.map((group: PermissionGroupName) => (
          <PermissionGroup
            key={group}
            group={group}
            userName={userName}
            permissions={permissions.filter((permission) => permission.key.startsWith(`${group}.`))}
            busyKey={busyKey}
            onGrant={onGrant}
            onRevoke={onRevoke}
          />
        ))}
      </div>
    </>
  )
}

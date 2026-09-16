import type { EffectivePermission, PermissionGroupName, PermissionToggleSpec } from '@/types'
import { PermissionRow } from './PermissionRow'

interface PermissionGroupProps {
  group: PermissionGroupName
  userName: string
  permissions: EffectivePermission[]
  busyKey: string | null
  onGrant?(key: string, expiresAt?: string | null): void
  onRevoke?(key: string): void
  toggle?: PermissionToggleSpec
}

export function PermissionGroup({
  group,
  userName,
  permissions,
  busyKey,
  onGrant,
  onRevoke,
  toggle,
}: PermissionGroupProps) {
  const anchor = `perm-${group.toLowerCase()}`
  return (
    <section className="ledger-group" id={anchor} aria-label={`${group} permissions`}>
      <div className="ledger-group__head">
        <span>
          {group} ({permissions.length})
        </span>
        <span className="mock-badge">手帳</span>
      </div>
      <div className="perm-group">
        {permissions.length === 0 ? (
          <div className="perm-row">
            <div className="perm-row__main">
              <span className="perm-source">No permissions in this group.</span>
            </div>
          </div>
        ) : (
          permissions.map((permission) => (
            <PermissionRow
              key={permission.key}
              permission={permission}
              userName={userName}
              busy={busyKey === permission.key}
              onGrant={
                onGrant ? (expiresAt) => onGrant(permission.key, expiresAt) : undefined
              }
              onRevoke={onRevoke ? () => onRevoke(permission.key) : undefined}
              toggle={
                toggle
                  ? {
                      checked: toggle.isChecked(permission.key),
                      disabled: toggle.disabled,
                      onChange: (checked) => toggle.setChecked(permission.key, checked),
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>
    </section>
  )
}

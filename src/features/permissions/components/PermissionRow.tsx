import { useState } from 'react'
import type { EffectivePermission } from '@/types'
import { cn } from '@/lib/cn'
import { permissionLabel } from '@/hooks/useEffectivePermissions'

interface PermissionRowProps {
  permission: EffectivePermission
  busy: boolean
  onGrant(expiresAt?: string | null): void
  onRevoke(): void
}

export function PermissionRow({ permission, busy, onGrant, onRevoke }: PermissionRowProps) {
  const [expiry, setExpiry] = useState('')
  const stateClass = permission.effective ? 'perm-state--on' : 'perm-state--off'
  const sourceClass =
    permission.source === 'direct grant'
      ? 'perm-source--grant'
      : permission.source === 'direct deny'
        ? 'perm-source--deny'
        : undefined
  return (
    <div className="perm-row">
      <span aria-hidden="true" />
      <div className="perm-row__main">
        <span className="perm-name">{permissionLabel(permission.key)}</span>
        <span className="perm-meta">
          <span className={cn('perm-state', stateClass)}>
            {permission.effective ? 'Effective' : 'Denied'}
          </span>
          <span className={cn('perm-source', sourceClass)}>{permission.source}</span>
          {permission.expiry ? (
            <span className="perm-expiry">
              <time dateTime={permission.expiry}>{permission.expiry.slice(0, 10)}</time>
            </span>
          ) : null}
        </span>
      </div>
      <div className="perm-action">
        {permission.effective ? (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={busy}
            onClick={onRevoke}
          >
            Revoke
          </button>
        ) : (
          <>
            <label className="perm-expiry">
              <span className="sr-only">Expiry for {permission.key}</span>
              <input
                className="input"
                type="date"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={busy}
              onClick={() => onGrant(expiry || null)}
            >
              Grant
            </button>
          </>
        )}
      </div>
    </div>
  )
}

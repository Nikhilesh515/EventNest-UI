import { useEffect, useRef, useState } from 'react'
import type { EffectivePermission, PermissionToggle } from '@/types'
import { cn } from '@/lib/cn'
import { fmtDate } from '@/lib/format'

interface PermissionRowProps {
  permission: EffectivePermission
  userName: string
  busy: boolean
  onGrant?(expiresAt?: string | null): void
  onRevoke?(): void
  toggle?: PermissionToggle
}

export function PermissionRow({
  permission,
  userName,
  busy,
  onGrant,
  onRevoke,
  toggle,
}: PermissionRowProps) {
  const [confirm, setConfirm] = useState<'revoke' | 'grant' | null>(null)
  const [expiry, setExpiry] = useState('')
  const keepRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (confirm) keepRef.current?.focus()
  }, [confirm])

  if (toggle) {
    const toggleStateClass = toggle.checked ? 'perm-state--on' : 'perm-state--off'
    return (
      <div className="perm-row">
        <div className="perm-row__main">
          <span className="perm-name">{permission.key}</span>
          <span className="perm-meta">
            <span className={cn('perm-state', toggleStateClass)}>
              {toggle.checked ? 'Included' : 'Excluded'}
            </span>
          </span>
        </div>
        <div className="perm-action">
          <button
            type="button"
            role="switch"
            aria-checked={toggle.checked}
            aria-label={`${permission.key} ${toggle.checked ? 'included' : 'excluded'}`}
            className={cn('btn', 'btn--sm', toggle.checked ? 'btn--primary' : 'btn--secondary')}
            disabled={toggle.disabled}
            onClick={() => toggle.onChange(!toggle.checked)}
          >
            {toggle.checked ? 'Remove' : 'Add'}
          </button>
        </div>
      </div>
    )
  }

  const stateClass = permission.effective ? 'perm-state--on' : 'perm-state--off'
  const sourceClass =
    permission.source === 'direct grant'
      ? 'perm-source--grant'
      : permission.source === 'direct deny'
        ? 'perm-source--deny'
        : undefined
  const canRevoke = permission.source === 'direct grant'
  const firstName = userName.split(/\s+/)[0] ?? userName

  return (
    <div className="perm-row">
      <div className="perm-row__main">
        <span className="perm-name">{permission.key}</span>
        <span className="perm-meta">
          <span className={cn('perm-state', stateClass)}>
            {permission.effective ? 'Effective' : 'Denied'}
          </span>
          <span className={cn('perm-source', sourceClass)}>{permission.source}</span>
          {permission.expiry ? (
            <time className="perm-expiry" dateTime={permission.expiry}>
              Expires {fmtDate(permission.expiry)}
            </time>
          ) : null}
        </span>
      </div>
      <div className="perm-action">
        {confirm === 'revoke' ? (
          <div className="perm-confirm">
            <span className="perm-confirm__msg">
              Revoke {permission.key} from {firstName}?
            </span>
            <button
              ref={keepRef}
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setConfirm(null)}
            >
              Keep
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              disabled={busy}
              onClick={() => {
                setConfirm(null)
                onRevoke?.()
              }}
            >
              Revoke
            </button>
          </div>
        ) : confirm === 'grant' ? (
          <div className="perm-confirm">
            <label className="sr-only" htmlFor={`exp-${permission.key}`}>
              Expiry (optional)
            </label>
            <input
              id={`exp-${permission.key}`}
              className="input select--inline"
              type="date"
              value={expiry}
              aria-label="Expiry date (optional)"
              onChange={(event) => setExpiry(event.target.value)}
            />
            <button
              ref={keepRef}
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setConfirm(null)}
            >
              Keep
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={busy}
              onClick={() => {
                setConfirm(null)
                onGrant?.(expiry || null)
              }}
            >
              Grant
            </button>
          </div>
        ) : canRevoke ? (
          <button
            type="button"
            className="btn btn--danger btn--sm"
            disabled={busy}
            onClick={() => setConfirm('revoke')}
          >
            Revoke
          </button>
        ) : !permission.effective ? (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={busy}
            onClick={() => setConfirm('grant')}
          >
            Grant
          </button>
        ) : (
          <span className="perm-expiry" aria-hidden="true">
            —
          </span>
        )}
      </div>
    </div>
  )
}

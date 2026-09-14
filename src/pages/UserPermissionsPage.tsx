import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/app/providers/ToastProvider'
import { useUser } from '@/features/users/useUser'
import { usePermissions } from '@/features/permissions/usePermissions'
import { useUserPermissions } from '@/features/permissions/useUserPermissions'
import { useGrantPermission } from '@/features/permissions/useGrantPermission'
import { useRevokePermission } from '@/features/permissions/useRevokePermission'
import { FEATURES } from '@/lib/features'
import { computeEffective } from '@/hooks/useEffectivePermissions'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { PageDoc } from '@/components/data-display/PageDoc'
import { StatRow } from '@/components/data-display/StatRow'
import { StatCard } from '@/components/data-display/StatCard'
import { PermissionLedger } from '@/features/permissions/components/PermissionLedger'
import { PermissionCacheNote } from '@/features/permissions/components/PermissionCacheNote'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'

export default function UserPermissionsPage() {
  const { id = '' } = useParams()
  const { push } = useToast()
  const userQuery = useUser(id)
  const catalogQuery = usePermissions()
  const effectiveQuery = useUserPermissions(id)
  const grant = useGrantPermission(id)
  const revoke = useRevokePermission(id)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  if (!FEATURES.permissions) {
    return (
      <div className="stack-6">
        <Breadcrumbs items={[{ label: 'Admin', href: '/admin/users' }, { label: 'Permissions' }]} />
        <PageDoc title="Permissions" overline="Admin · 手帳" kanji="手帳" tapeVariant="shu" />
        <ErrorState
          title="Permission management is not available yet."
          body="The gateway route /api/permissions/** has not shipped (BP-01). Grant and revoke stay disabled until it is reachable."
          mascot="kokeshi"
          secondary={{ label: 'Back to users', to: '/admin/users' }}
        />
        <PermissionCacheNote />
      </div>
    )
  }

  if (userQuery.isLoading || catalogQuery.isLoading || effectiveQuery.isLoading)
    return <SkeletonRows count={6} />
  if (userQuery.isError || catalogQuery.isError || effectiveQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          void userQuery.refetch()
          void catalogQuery.refetch()
          void effectiveQuery.refetch()
        }}
      />
    )
  }
  const target = userQuery.data
  if (!target) return null
  const effective = computeEffective(
    target.role,
    new Set((effectiveQuery.data ?? []).map((permission) => permission.name)),
  )
  const effectiveCount = effective.filter((permission) => permission.effective).length
  const directGrants = effective.filter((permission) => permission.source === 'direct grant').length
  const directDenies = effective.filter((permission) => permission.source === 'direct deny').length

  return (
    <div className="stack-6">
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Users', href: '/admin/users' },
          { label: target.displayName },
          { label: 'Permissions' },
        ]}
      />
      <PageDoc
        title="Permissions"
        overline="Admin · 手帳"
        kanji="手帳"
        tapeVariant="shu"
        subtitle={`${target.displayName} · ${target.email} · Role: ${target.role}`}
      />
      <div className="stats-wrap" style={{ marginTop: 'var(--space-4)' }}>
        <StatRow>
          <StatCard label="Effective" value={effectiveCount} tone="capacity" />
          <StatCard label="Direct grants" value={directGrants} tone="guests" />
          <StatCard label="Direct denies" value={directDenies} tone="cancelled" />
        </StatRow>
      </div>
      <PermissionCacheNote />
      <PermissionLedger
        permissions={effective}
        userName={target.displayName}
        busyKey={busyKey}
        onGrant={(key, expiresAt) => {
          setBusyKey(key)
          void grant
            .mutateAsync({ permissionName: key, expiresAt: expiresAt ?? null })
            .then(() =>
              push({
                kind: 'success',
                title: `Granted ${key}`,
                body: 'It may take up to 5 minutes to apply.',
              }),
            )
            .catch(() =>
              push({
                kind: 'error',
                title: 'Grant failed',
                body: "The stall didn't answer in time.",
              }),
            )
            .finally(() => setBusyKey(null))
        }}
        onRevoke={(key) => {
          setBusyKey(key)
          void revoke
            .mutateAsync({ permissionName: key })
            .then(() =>
              push({
                kind: 'info',
                title: `Revoked ${key}`,
                body: 'Cache may take up to 5 minutes.',
              }),
            )
            .catch(() =>
              push({
                kind: 'error',
                title: 'Revoke failed',
                body: "The stall didn't answer in time.",
              }),
            )
            .finally(() => setBusyKey(null))
        }}
      />
    </div>
  )
}

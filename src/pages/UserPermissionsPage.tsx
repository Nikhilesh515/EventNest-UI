import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from '@/features/users/useUser'
import { usePermissions } from '@/features/permissions/usePermissions'
import { useUserPermissions } from '@/features/permissions/useUserPermissions'
import { useGrantPermission } from '@/features/permissions/useGrantPermission'
import { useRevokePermission } from '@/features/permissions/useRevokePermission'
import { useAuth } from '@/features/auth/AuthContext'
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
  const { user: actor } = useAuth()
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
        <PageDoc title="Permissions" overline="Admin" kanji="手帳" tapeVariant="shu" />
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
  const directGrants = effective.filter((permission) => permission.source === 'direct grant').length

  return (
    <div className="stack-6">
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: target.displayName, href: `/admin/users/${target.id}/permissions` },
          { label: 'Permissions' },
        ]}
      />
      <PageDoc
        title="Permissions"
        overline="Admin"
        kanji="手帳"
        tapeVariant="shu"
        subtitle={`${target.displayName} · ${target.email} · Role: ${target.role}`}
      />
      <StatRow>
        <StatCard
          label="Effective"
          value={effective.filter((permission) => permission.effective).length}
        />
        <StatCard label="Direct grants" value={directGrants} />
        <StatCard label="Direct denies" value={0} />
      </StatRow>
      <PermissionCacheNote />
      <PermissionLedger
        permissions={effective}
        busyKey={busyKey}
        onGrant={(key, expiresAt) => {
          setBusyKey(key)
          void grant
            .mutateAsync({ permissionName: key, expiresAt: expiresAt ?? null })
            .finally(() => setBusyKey(null))
        }}
        onRevoke={(key) => {
          setBusyKey(key)
          void revoke.mutateAsync({ permissionName: key }).finally(() => setBusyKey(null))
        }}
      />
      <span hidden>{actor?.id}</span>
    </div>
  )
}

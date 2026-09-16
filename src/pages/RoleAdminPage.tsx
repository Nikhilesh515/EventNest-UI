import { useState } from 'react'
import type { RoleDto } from '@/types'
import { useRoles } from '@/features/roles/useRoles'
import { useCreateRole } from '@/features/roles/useCreateRole'
import { useUpdateRole } from '@/features/roles/useUpdateRole'
import { useDeleteRole } from '@/features/roles/useDeleteRole'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { useToast } from '@/app/providers/ToastProvider'
import { AppApiError } from '@/api/errors'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { Icon } from '@/components/icons/Icon'
import { PageDoc } from '@/components/data-display/PageDoc'
import { PunchTable } from '@/components/data-display/PunchTable'
import { RoleFormModal } from '@/features/roles/components/RoleFormModal'
import { RoleTableRow } from '@/features/roles/components/RoleTableRow'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'

export default function RoleAdminPage() {
  const { hasPermission } = useAuth()
  const { push } = useToast()
  const roles = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const [editing, setEditing] = useState<RoleDto | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<RoleDto | null>(null)

  const canManage = hasPermission(EventNestPermissions.Users.Manage)
  const rows = roles.data ?? []

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/users' }, { label: 'Roles' }]} />
      <PageDoc
        title="Roles"
        overline="Admin"
        kanji="役割"
        tapeVariant="shu"
        subtitle={`${rows.length} roles`}
        actions={
          canManage ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Icon name="plus" size={18} />
              Create role
            </button>
          ) : null
        }
      />
      {roles.isLoading ? <SkeletonRows count={5} /> : null}
      {roles.isError ? <ErrorState onRetry={() => void roles.refetch()} /> : null}
      {roles.isSuccess && rows.length === 0 ? (
        <EmptyState title="No roles yet." body="Create the first role for the team." />
      ) : null}
      {rows.length > 0 ? (
        <PunchTable
          caption="Roles"
          columns={[
            { key: 'role', header: 'Role' },
            { key: 'permissions', header: 'Permissions' },
            { key: 'users', header: 'Users' },
            { key: 'actions', header: 'Actions' },
          ]}
        >
          {rows.map((role) => (
            <RoleTableRow
              key={role.id}
              role={role}
              onEdit={() => {
                setEditing(role)
                setFormOpen(true)
              }}
              onDelete={() => setDeleting(role)}
            />
          ))}
        </PunchTable>
      ) : null}
      <RoleFormModal
        open={formOpen}
        role={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input) => {
          if (editing) {
            await updateRole.mutateAsync({
              id: editing.id,
              body: {
                displayName: input.displayName,
                description: input.description,
                sortOrder: input.sortOrder,
                permissionNames: input.permissionNames,
              },
            })
            push({ kind: 'success', title: 'Role updated', body: `"${input.displayName}" saved.` })
          } else {
            await createRole.mutateAsync(input)
            push({ kind: 'success', title: 'Role created', body: `"${input.displayName}" added.` })
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this role?"
        body="Deleting a role is permanent. Built-in roles and roles with assigned users cannot be deleted."
        confirmLabel="Delete role"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const target = deleting
          setDeleting(null)
          if (!target) return
          void deleteRole
            .mutateAsync(target.id)
            .then(() =>
              push({ kind: 'success', title: 'Role deleted', body: `"${target.displayName}" removed.` }),
            )
            .catch((caught: unknown) =>
              push({
                kind: 'error',
                title: 'Could not delete role',
                body: caught instanceof AppApiError ? caught.message : 'Unexpected error.',
              }),
            )
        }}
      />
    </div>
  )
}

import { useState } from 'react'
import type { UserDto } from '@/types'
import { useUsers } from '@/features/users/useUsers'
import { useUpdateUser } from '@/features/users/useUpdateUser'
import { useDeactivateUser } from '@/features/users/useDeactivateUser'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Pager } from '@/components/data-display/Pager'
import { PunchTable } from '@/components/data-display/PunchTable'
import { UserTableRow } from '@/features/users/components/UserTableRow'
import { TextField } from '@/components/forms/TextField'
import { Modal } from '@/components/overlays/Modal'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'

export default function UserAdminPage() {
  const { hasPermission } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [query, setQuery] = useState('')
  const users = useUsers(page, pageSize)
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [draftName, setDraftName] = useState('')
  const [deactivating, setDeactivating] = useState<UserDto | null>(null)
  const canManage = hasPermission(EventNestPermissions.Users.Manage)
  const rows = users.data ?? []
  const hasNext = rows.length === pageSize
  const term = query.trim().toLowerCase()
  const visible = term
    ? rows.filter((user) =>
        `${user.displayName} ${user.email} ${user.role}`.toLowerCase().includes(term),
      )
    : rows

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/users' }, { label: 'Users' }]} />
      <PageDoc
        title="Users"
        overline="Admin"
        kanji="手帳"
        tapeVariant="shu"
        actions={
          <TextField
            id="user-search"
            type="search"
            placeholder="Search name, email or role"
            aria-label="Search users"
            value={query}
            leadingIcon="search"
            onChange={(event) => setQuery(event.target.value)}
          />
        }
      />
      {users.isLoading ? <SkeletonRows count={6} /> : null}
      {users.isError ? <ErrorState onRetry={() => void users.refetch()} /> : null}
      {users.isSuccess && visible.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? 'No users found.' : 'No users match that search.'}
          body={
            rows.length === 0
              ? 'Nothing on this page. Try the previous page.'
              : 'Try a different name, email or role.'
          }
        />
      ) : null}
      {visible.length > 0 ? (
        <PunchTable
          caption="Users"
          columns={[
            { key: 'user', header: 'User' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
            { key: 'status', header: 'Status' },
            { key: 'created', header: 'Created' },
            { key: 'actions', header: 'Actions' },
          ]}
        >
          {visible.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              canManage={canManage}
              onEdit={() => {
                setEditing(user)
                setDraftName(user.displayName)
              }}
              onDeactivate={() => setDeactivating(user)}
            />
          ))}
        </PunchTable>
      ) : null}
      {users.isSuccess ? (
        <Pager
          page={page}
          pages={hasNext ? page + 1 : page}
          total={rows.length}
          pageSize={pageSize}
          sizeOptions={[10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      ) : null}
      <Modal
        open={Boolean(editing)}
        title="Edit display name"
        onClose={() => setEditing(null)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                if (editing)
                  void updateUser.mutateAsync({ id: editing.id, body: { displayName: draftName } })
                setEditing(null)
              }}
            >
              Save
            </button>
          </>
        }
      >
        <TextField
          id="admin-user-name"
          label="Display name"
          value={draftName}
          maxLength={100}
          onChange={(event) => setDraftName(event.target.value)}
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Deactivate this user?"
        body="They will no longer be able to log in."
        confirmLabel="Deactivate"
        danger
        onCancel={() => setDeactivating(null)}
        onConfirm={() => {
          if (deactivating) void deactivateUser.mutateAsync(deactivating.id)
          setDeactivating(null)
        }}
      />
    </div>
  )
}

import { useState } from 'react'
import type { UserDto } from '@/types'
import { useUsers } from '@/features/users/useUsers'
import { useUpdateUser } from '@/features/users/useUpdateUser'
import { useDeactivateUser } from '@/features/users/useDeactivateUser'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Pager } from '@/components/data-display/Pager'
import { PunchTable } from '@/components/data-display/PunchTable'
import { UserTableRow } from '@/features/users/components/UserTableRow'
import { Modal } from '@/components/overlays/Modal'
import { TextField } from '@/components/forms/TextField'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'

export default function UserAdminPage() {
  const { hasPermission } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const users = useUsers(page, pageSize)
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [draftName, setDraftName] = useState('')
  const [deactivating, setDeactivating] = useState<UserDto | null>(null)
  const canManage = hasPermission(EventNestPermissions.Users.Manage)
  const rows = users.data ?? []
  const hasNext = rows.length === pageSize

  return (
    <div className="stack-6">
      <PageDoc
        title="Users"
        overline="Admin"
        kanji="手帳"
        tapeVariant="shu"
        subtitle="Manage accounts and permissions"
      />
      {users.isLoading ? <SkeletonRows count={6} /> : null}
      {users.isError ? <ErrorState onRetry={() => void users.refetch()} /> : null}
      {users.isSuccess && rows.length === 0 ? (
        <EmptyState title="No users found." body="Nothing on this page." />
      ) : null}
      <PunchTable
        caption="Users"
        columns={[
          { key: 'user', header: 'User' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role' },
          { key: 'status', header: 'Status' },
          { key: 'actions', header: 'Actions' },
        ]}
      >
        {rows.map((user) => (
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
        body="They will no longer be able to log in. This is a soft state change."
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

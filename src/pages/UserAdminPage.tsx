import { useEffect, useState } from 'react'
import type { UserDto } from '@/types'
import { useUsers } from '@/features/users/useUsers'
import { useUpdateUser } from '@/features/users/useUpdateUser'
import { useDeactivateUser } from '@/features/users/useDeactivateUser'
import { useCreateUser } from '@/features/users/useCreateUser'
import { useAssignUserRole } from '@/features/users/useAssignUserRole'
import { useRoles } from '@/features/roles/useRoles'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { useToast } from '@/app/providers/ToastProvider'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { AppApiError } from '@/api/errors'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Pager } from '@/components/data-display/Pager'
import { PunchTable } from '@/components/data-display/PunchTable'
import { UserTableRow } from '@/features/users/components/UserTableRow'
import { TextField } from '@/components/forms/TextField'
import { Select } from '@/components/forms/Select'
import { ErrorSummary } from '@/components/forms/ErrorSummary'
import { Modal } from '@/components/overlays/Modal'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'

export default function UserAdminPage() {
  const { hasPermission } = useAuth()
  const { push } = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [roleFilter, setRoleFilter] = useState('')

  const users = useUsers({
    page,
    pageSize,
    search: debouncedSearch.trim() || undefined,
    role: roleFilter || undefined,
  })
  const roles = useRoles()
  const updateUser = useUpdateUser()
  const assignUserRole = useAssignUserRole()
  const createUser = useCreateUser()
  const deactivateUser = useDeactivateUser()

  const [editing, setEditing] = useState<UserDto | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftRoleId, setDraftRoleId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState({
    email: '',
    displayName: '',
    password: '',
    roleId: '',
  })
  const [createErrors, setCreateErrors] = useState<{ fieldId: string; message: string }[]>([])
  const [createBanner, setCreateBanner] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState<UserDto | null>(null)

  const canManage = hasPermission(EventNestPermissions.Users.Manage)
  const rows = users.data?.items ?? []
  const roleOptions = (roles.data ?? []).map((role) => ({
    value: role.id,
    label: role.displayName,
  }))

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter])

  const hasQuery = Boolean(debouncedSearch.trim() || roleFilter)

  async function handleCreate() {
    const errors: { fieldId: string; message: string }[] = []
    if (!createDraft.email.trim()) errors.push({ fieldId: 'create-email', message: 'Email is required.' })
    if (!createDraft.displayName.trim())
      errors.push({ fieldId: 'create-displayName', message: 'Display name is required.' })
    if (!createDraft.password) errors.push({ fieldId: 'create-password', message: 'Password is required.' })
    if (!createDraft.roleId) errors.push({ fieldId: 'create-role', message: 'Choose a role.' })

    setCreateErrors(errors)
    setCreateBanner(null)
    if (errors.length > 0) return

    try {
      await createUser.mutateAsync({
        email: createDraft.email.trim(),
        displayName: createDraft.displayName.trim(),
        password: createDraft.password,
        roleId: createDraft.roleId,
      })
      push({ kind: 'success', title: 'User created', body: `${createDraft.displayName.trim()} added.` })
      setCreating(false)
    } catch (caught) {
      if (caught instanceof AppApiError) {
        const mapped = Object.entries(caught.fieldErrors).map(([field, message]) => ({
          fieldId: `create-${field}`,
          message,
        }))
        if (mapped.length > 0) setCreateErrors(mapped)
        else setCreateBanner(caught.message)
      } else {
        setCreateBanner('Could not create the user.')
      }
    }
  }

  async function handleEditSave() {
    if (!editing) return
    const nameChanged = draftName.trim() !== editing.displayName
    const roleChanged = draftRoleId !== editing.roleId

    try {
      if (nameChanged)
        await updateUser.mutateAsync({ id: editing.id, body: { displayName: draftName.trim() } })
      if (roleChanged) await assignUserRole.mutateAsync({ id: editing.id, roleId: draftRoleId })
      if (nameChanged || roleChanged) {
        push({
          kind: 'success',
          title: 'User updated',
          body: `${draftName.trim()} saved.`,
        })
      }
      setEditing(null)
    } catch (caught) {
      push({
        kind: 'error',
        title: 'Could not update user',
        body: caught instanceof AppApiError ? caught.message : 'Unexpected error.',
      })
    }
  }

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/users' }, { label: 'Users' }]} />
      <PageDoc
        title="Users"
        overline="Admin"
        kanji="手帳"
        tapeVariant="shu"
        actions={
          <div className="cluster-3">
            <TextField
              id="user-search"
              type="search"
              placeholder="Search name or email"
              aria-label="Search users"
              value={searchInput}
              leadingIcon="search"
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Select
              inline
              ariaLabel="Filter by role"
              value={roleFilter}
              options={[{ value: '', label: 'All roles' }, ...roleOptions]}
              onChange={setRoleFilter}
            />
            {canManage ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setCreateDraft({ email: '', displayName: '', password: '', roleId: '' })
                  setCreateErrors([])
                  setCreateBanner(null)
                  setCreating(true)
                }}
              >
                Create user
              </button>
            ) : null}
          </div>
        }
      />
      {users.isLoading ? <SkeletonRows count={6} /> : null}
      {users.isError ? <ErrorState onRetry={() => void users.refetch()} /> : null}
      {users.isSuccess && rows.length === 0 ? (
        <EmptyState
          title={hasQuery ? 'No users match that search.' : 'No users found.'}
          body={
            hasQuery
              ? 'Try a different name, email or role.'
              : 'Nothing on this page. Try the previous page.'
          }
        />
      ) : null}
      {rows.length > 0 ? (
        <PunchTable
          caption="Users"
          columns={[
            { key: 'user', header: 'User', width: '22%' },
            { key: 'email', header: 'Email', width: '24%' },
            { key: 'role', header: 'Role', width: '12%' },
            { key: 'status', header: 'Status', width: '10%' },
            { key: 'created', header: 'Created', width: '14%' },
            { key: 'actions', header: 'Actions', width: '18%' },
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
                setDraftRoleId(user.roleId ?? '')
              }}
              onDeactivate={() => setDeactivating(user)}
            />
          ))}
        </PunchTable>
      ) : null}
      {users.isSuccess ? (
        <Pager
          page={users.data.page}
          pages={users.data.pages}
          total={users.data.total}
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
        title="Edit user"
        onClose={() => setEditing(null)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={() => void handleEditSave()}>
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
        <Select
          id="admin-user-role"
          label="Role"
          value={draftRoleId}
          options={roleOptions}
          onChange={setDraftRoleId}
        />
      </Modal>
      <Modal
        open={creating}
        title="Create user"
        onClose={() => setCreating(false)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={createUser.isPending}
              onClick={() => void handleCreate()}
            >
              {createUser.isPending ? 'Saving.' : 'Save user'}
            </button>
          </>
        }
      >
        {createBanner ? (
          <p className="banner banner--error" role="alert">
            {createBanner}
          </p>
        ) : null}
        <ErrorSummary errors={createErrors} />
        <TextField
          id="create-email"
          type="email"
          label="Email"
          value={createDraft.email}
          error={createErrors.find((entry) => entry.fieldId === 'create-email')?.message}
          onChange={(event) => setCreateDraft((draft) => ({ ...draft, email: event.target.value }))}
        />
        <TextField
          id="create-displayName"
          label="Display name"
          value={createDraft.displayName}
          maxLength={100}
          error={createErrors.find((entry) => entry.fieldId === 'create-displayName')?.message}
          onChange={(event) =>
            setCreateDraft((draft) => ({ ...draft, displayName: event.target.value }))
          }
        />
        <TextField
          id="create-password"
          type="password"
          label="Password"
          value={createDraft.password}
          error={createErrors.find((entry) => entry.fieldId === 'create-password')?.message}
          onChange={(event) =>
            setCreateDraft((draft) => ({ ...draft, password: event.target.value }))
          }
        />
        <Select
          id="create-role"
          label="Role"
          value={createDraft.roleId}
          options={[{ value: '', label: 'Choose a role' }, ...roleOptions]}
          onChange={(roleId) => setCreateDraft((draft) => ({ ...draft, roleId }))}
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

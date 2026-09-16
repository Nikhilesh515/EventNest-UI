import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ConfirmModal } from '../components/ConfirmModal';
import { SheetPager } from '../components/SheetPager';
import { PermissionModal } from '../components/PermissionModal';
import { useDebounce } from '../hooks/use-debounce';

function getRoleBadgeClass(roleName: string): string {
  switch (roleName.toLowerCase()) {
    case 'superadmin': return 'badge--superadmin';
    case 'admin': return 'badge--admin';
    case 'moderator': return 'badge--moderator';
    case 'organizer': return 'badge--organizer';
    default: return 'badge--user';
  }
}

interface UserDto {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
}

interface RoleDto {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  sortOrder: number;
  permissionNames: string[];
  userCount: number;
  createdAt: string;
}

interface PaginatedUsers {
  items: UserDto[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const debouncedSearch = useDebounce(search, 300);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserDto | null>(null);
  const [permUser, setPermUser] = useState<UserDto | null>(null);

  const [createEmail, setCreateEmail] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRoleId, setCreateRoleId] = useState('');

  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRoleId, setEditRoleId] = useState('');

  const { data: roles } = useQuery<RoleDto[]>({
    queryKey: ['roles'],
    queryFn: () => api.get<{ result: RoleDto[] }>('/api/roles').then(r => r.result),
  });

  const { data: users, isLoading } = useQuery<PaginatedUsers>({
    queryKey: ['users', page, pageSize, debouncedSearch, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter) params.set('role', roleFilter);
      return api.get<{ result: PaginatedUsers }>(`/api/users?${params}`).then(r => r.result);
    },
  });

  const createMut = useMutation({
    mutationFn: (data: { email: string; displayName: string; password: string; roleId: string }) =>
      api.post('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetCreateForm();
      setShowCreate(false);
    },
  });

  const updateDisplayNameMut = useMutation({
    mutationFn: ({ id, displayName }: { id: string; displayName: string }) =>
      api.put(`/api/users/${id}`, { displayName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
    },
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      api.put(`/api/users/${id}/role`, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUser(null);
    },
  });

  function resetCreateForm() {
    setCreateEmail('');
    setCreateDisplayName('');
    setCreatePassword('');
    setCreateRoleId('');
  }

  function startCreate() {
    resetCreateForm();
    setShowCreate(true);
  }

  function startEdit(user: UserDto) {
    setEditUser(user);
    setEditDisplayName(user.displayName);
    setEditRoleId(user.roleId);
  }

  function handleCreate() {
    createMut.mutate({
      email: createEmail,
      displayName: createDisplayName,
      password: createPassword,
      roleId: createRoleId,
    });
  }

  function handleEdit() {
    if (!editUser) return;
    if (editDisplayName !== editUser.displayName) {
      updateDisplayNameMut.mutate({ id: editUser.id, displayName: editDisplayName });
    }
    if (editRoleId !== editUser.roleId) {
      updateRoleMut.mutate({ id: editUser.id, roleId: editRoleId });
    }
    if (editDisplayName === editUser.displayName && editRoleId === editUser.roleId) {
      setEditUser(null);
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  function handleSizeChange(newSize: number) {
    setPageSize(newSize);
    setPage(1);
  }

  return (
    <div className="page-admin">
      <Breadcrumbs
        items={[
          { label: 'Events', href: '/events' },
          { label: 'System', href: '/admin/users' },
          { label: 'Users' },
        ]}
      />
      <div className="page-admin__header">
        <span className="page-admin__kanji" aria-hidden="true">人</span>
        <div>
          <p className="page-admin__overline">System Administration</p>
          <h1 className="page-admin__title">Users</h1>
          <p className="page-admin__subtitle">Manage users and their roles</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={startCreate}>
          + Create User
        </button>
      </div>

      <div className="washi" style={{ '--washi-color': 'var(--sora-200)' } as React.CSSProperties} />

      <div className="page-admin__filters">
        <div className="search-field">
          <span className="search-field__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="select"
        >
          <option value="">All Roles</option>
          {roles?.map(role => (
            <option key={role.id} value={role.id}>{role.displayName}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="ledger">
            <div className="ledger__head">
              <span></span>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {users?.items.map(user => {
              const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const roleBadgeClass = getRoleBadgeClass(user.roleName);
              return (
                <div key={user.id} className="ledger__row">
                  <div className="user-avatar">{initials}</div>
                  <span className="user-name">{user.displayName}</span>
                  <span className="tnum">{user.email}</span>
                  <span><span className={`badge ${roleBadgeClass}`}>{user.roleName}</span></span>
                  <span>{user.isActive ? <span className="badge badge--active">Active</span> : <span className="badge badge--inactive">Inactive</span>}</span>
                  <span className="ledger__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(user)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPermUser(user)}>
                      Permissions
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm btn--danger" onClick={() => setDeleteUser(user)}>
                      Delete
                    </button>
                  </span>
                </div>
              );
            })}
          </div>

          {users && (
            <SheetPager
              page={users.page}
              pages={users.pages}
              size={users.pageSize}
              total={users.total}
              sizeOptions={[9, 18, 36]}
              label="users"
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
            />
          )}
        </>
      )}

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create User</h2>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="create-email">Email <span className="req">*</span></label>
                <span className="field__count">{createEmail.length} / 255</span>
              </div>
              <input
                id="create-email"
                className="input"
                type="email"
                maxLength={255}
                required
                value={createEmail}
                onChange={e => setCreateEmail(e.target.value)}
              />
              <p className="field__hint">The email address for login.</p>
            </div>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="create-display">Display Name <span className="req">*</span></label>
                <span className="field__count">{createDisplayName.length} / 100</span>
              </div>
              <input
                id="create-display"
                className="input"
                type="text"
                maxLength={100}
                required
                value={createDisplayName}
                onChange={e => setCreateDisplayName(e.target.value)}
              />
              <p className="field__hint">The name displayed in the app.</p>
            </div>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="create-password">Password <span className="req">*</span></label>
                <span className="field__count">{createPassword.length} / 128</span>
              </div>
              <input
                id="create-password"
                className="input"
                type="password"
                maxLength={128}
                required
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
              />
              <p className="field__hint">Minimum 8 characters.</p>
            </div>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="create-role">Role <span className="req">*</span></label>
              </div>
              <select
                id="create-role"
                className="input"
                required
                value={createRoleId}
                onChange={e => setCreateRoleId(e.target.value)}
              >
                <option value="">Select role...</option>
                {roles?.map(role => (
                  <option key={role.id} value={role.id}>{role.displayName}</option>
                ))}
              </select>
              <p className="field__hint">The user&#39;s role determines their permissions.</p>
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!createEmail || !createDisplayName || !createPassword || !createRoleId || createMut.isPending}
                onClick={handleCreate}
              >
                {createMut.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="modal-backdrop" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="edit-display">Display Name <span className="req">*</span></label>
                <span className="field__count">{editDisplayName.length} / 100</span>
              </div>
              <input
                id="edit-display"
                className="input"
                type="text"
                maxLength={100}
                required
                value={editDisplayName}
                onChange={e => setEditDisplayName(e.target.value)}
              />
              <p className="field__hint">The name displayed in the app.</p>
            </div>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="edit-role">Role <span className="req">*</span></label>
              </div>
              <select
                id="edit-role"
                className="input"
                required
                value={editRoleId}
                onChange={e => setEditRoleId(e.target.value)}
              >
                {roles?.map(role => (
                  <option key={role.id} value={role.id}>{role.displayName}</option>
                ))}
              </select>
              <p className="field__hint">Changing the role updates permissions immediately.</p>
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setEditUser(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={updateDisplayNameMut.isPending || updateRoleMut.isPending}
                onClick={handleEdit}
              >
                {(updateDisplayNameMut.isPending || updateRoleMut.isPending) ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <ConfirmModal
          open={true}
          title="Delete User"
          body={`Are you sure you want to delete "${deleteUser.displayName}"? This will deactivate the user account.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => deleteMut.mutate(deleteUser.id)}
          onCancel={() => setDeleteUser(null)}
          danger
        />
      )}

      <PermissionModal
        open={!!permUser}
        mode="user"
        userId={permUser?.id}
        onClose={() => setPermUser(null)}
        onSave={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />
    </div>
  );
}

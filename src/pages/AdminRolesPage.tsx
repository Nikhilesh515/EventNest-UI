import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ConfirmModal } from '../components/ConfirmModal';
import { PermissionModal } from '../components/PermissionModal';

function getRoleBadgeClass(roleName: string): string {
  switch (roleName.toLowerCase()) {
    case 'superadmin': return 'badge--superadmin';
    case 'admin': return 'badge--admin';
    case 'moderator': return 'badge--moderator';
    case 'organizer': return 'badge--organizer';
    default: return 'badge--user';
  }
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

export function AdminRolesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);
  const [permRole, setPermRole] = useState<RoleDto | null>(null);

  const { data: roles, isLoading } = useQuery<RoleDto[]>({
    queryKey: ['roles'],
    queryFn: () => api.get<{ result: RoleDto[] }>('/api/roles').then((r) => r.result),
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string; displayName: string; description?: string; permissionNames: string[] }) =>
      api.post<{ result: RoleDto }>('/api/roles', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      resetForm();
      setPermRole(res.result);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; displayName?: string; description?: string }) =>
      api.put<{ result: RoleDto }>(`/api/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteTarget(null);
    },
  });

  function resetForm() {
    setCreating(false);
    setEditingId(null);
    setFormName('');
    setFormDisplayName('');
    setFormDescription('');
  }

  function startCreate() {
    resetForm();
    setCreating(true);
  }

  function startEdit(role: RoleDto) {
    setCreating(false);
    setEditingId(role.id);
    setFormName(role.name);
    setFormDisplayName(role.displayName);
    setFormDescription(role.description ?? '');
  }

  function handleSubmit() {
    const data = {
      name: formName,
      displayName: formDisplayName,
      description: formDescription || undefined,
    };
    if (editingId) {
      updateMut.mutate({ id: editingId, ...data });
    } else {
      createMut.mutate({ ...data, permissionNames: [] });
    }
  }

  return (
    <div className="page-admin">
      <Breadcrumbs
        items={[
          { label: 'Events', href: '/events' },
          { label: 'System', href: '/admin/users' },
          { label: 'Roles', href: '/admin/roles' },
        ]}
      />
      <div className="page-admin__header">
        <span className="page-admin__kanji" aria-hidden="true">役</span>
        <div>
          <p className="page-admin__overline">System Administration</p>
          <h1 className="page-admin__title">Roles</h1>
          <p className="page-admin__subtitle">Manage roles and their permissions</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={startCreate}>
          + Create Role
        </button>
      </div>

      <div className="washi" style={{ '--washi-color': 'var(--fuji-200)' } as React.CSSProperties} />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="ledger ledger--roles">
          <div className="ledger__head">
            <span>Name</span>
            <span>Display Name</span>
            <span className="center">Permissions</span>
            <span className="center">Users</span>
            <span>Actions</span>
          </div>
          {roles?.map((role) => {
            const roleBadgeClass = getRoleBadgeClass(role.name);
            return (
              <div key={role.id} className="ledger__row">
                <span><span className={`badge ${roleBadgeClass}`}>{role.name}</span></span>
                <span>{role.displayName}</span>
                <span className="center"><span className="perm-count">{role.permissionNames.length}</span></span>
                <span className="center tnum">{role.userCount}</span>
                <span className="ledger__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(role)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPermRole(role)}>
                    Permissions
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm btn--danger"
                    disabled={role.name === 'User' || role.name === 'Organizer' || role.name === 'Moderator' || role.name === 'Admin' || role.name === 'SuperAdmin'}
                    onClick={() => setDeleteTarget(role)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editingId) && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Role' : 'Create Role'}</h2>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="role-name">Name <span className="req">*</span></label>
                <span className="field__count">{formName.length} / 50</span>
              </div>
              <input
                id="role-name"
                className="input"
                type="text"
                maxLength={50}
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={!!editingId}
              />
              <p className="field__hint">Unique identifier for the role.</p>
            </div>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="role-display">Display Name <span className="req">*</span></label>
                <span className="field__count">{formDisplayName.length} / 100</span>
              </div>
              <input
                id="role-display"
                className="input"
                type="text"
                maxLength={100}
                required
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
              />
              <p className="field__hint">Human-readable name for the role.</p>
            </div>
            <div className="field field--lined">
              <div className="field__top">
                <label className="field__label" htmlFor="role-desc">Description</label>
                <span className="field__count">{formDescription.length} / 500</span>
              </div>
              <textarea
                id="role-desc"
                className="textarea"
                maxLength={500}
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
              <p className="field__hint">Optional description of the role&#39;s purpose.</p>
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn--secondary" onClick={resetForm}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!formName || !formDisplayName || createMut.isPending || updateMut.isPending}
                onClick={handleSubmit}
              >
                {editingId ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          open={true}
          title="Delete Role"
          body={
            deleteTarget.userCount > 0
              ? `Role "${deleteTarget.name}" has ${deleteTarget.userCount} user(s). Reassign them first.`
              : `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => deleteMut.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}

      <PermissionModal
        open={!!permRole}
        mode="role"
        roleId={permRole?.id}
        onClose={() => setPermRole(null)}
        onSave={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
      />
    </div>
  );
}

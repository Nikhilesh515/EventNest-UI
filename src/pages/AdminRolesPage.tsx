import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ConfirmModal } from '../components/ConfirmModal';

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

const PERM_GROUPS = ['Events', 'Tags', 'RSVPs', 'Users'] as const;

export function AdminRolesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);

  const { data: roles, isLoading } = useQuery<RoleDto[]>({
    queryKey: ['roles'],
    queryFn: () => api.get<{ result: RoleDto[] }>('/api/roles').then((r) => r.result),
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string; displayName: string; description?: string; permissionNames: string[] }) =>
      api.post<{ result: RoleDto }>('/api/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; displayName?: string; description?: string; permissionNames?: string[] }) =>
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
    setFormPerms([]);
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
    setFormPerms([...role.permissionNames]);
  }

  function togglePerm(perm: string) {
    setFormPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  }

  function handleSubmit() {
    const data = {
      name: formName,
      displayName: formDisplayName,
      description: formDescription || undefined,
      permissionNames: formPerms,
    };
    if (editingId) {
      updateMut.mutate({ id: editingId, ...data });
    } else {
      createMut.mutate(data);
    }
  }

  const allPerms = [
    'Events.View', 'Events.Create', 'Events.Edit', 'Events.Delete',
    'Tags.View', 'Tags.Create', 'Tags.Edit', 'Tags.Delete',
    'RSVPs.View', 'RSVPs.Create', 'RSVPs.Edit', 'RSVPs.Manage', 'RSVPs.Cancel',
    'Users.View', 'Users.Manage',
  ];

  return (
    <div className="page-admin">
      <Breadcrumbs
        items={[
          { label: 'Events', href: '/events' },
          { label: 'Roles', href: '/admin/roles' },
        ]}
      />
      <div className="page-admin__header">
        <span className="page-admin__kanji" aria-hidden="true">役</span>
        <div>
          <h1 className="page-admin__title">Roles</h1>
          <p className="page-admin__subtitle">Manage roles and their permissions</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={startCreate}>
          Create Role
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="ledger">
          <div className="ledger__head">
            <span>Name</span>
            <span>Display Name</span>
            <span>Permissions</span>
            <span>Users</span>
            <span>Actions</span>
          </div>
          {roles?.map((role) => (
            <div key={role.id} className="ledger__row">
              <span className="tnum">{role.name}</span>
              <span>{role.displayName}</span>
              <span className="tnum">{role.permissionNames.length}</span>
              <span className="tnum">{role.userCount}</span>
              <span className="ledger__actions">
                <button type="button" className="btn btn--sm btn--secondary" onClick={() => startEdit(role)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  disabled={role.name === 'User' || role.name === 'Organizer' || role.name === 'Moderator' || role.name === 'Admin' || role.name === 'SuperAdmin'}
                  onClick={() => setDeleteTarget(role)}
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {(creating || editingId) && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Role' : 'Create Role'}</h2>
            <div className="form-group">
              <label htmlFor="role-name">Name</label>
              <input id="role-name" value={formName} onChange={(e) => setFormName(e.target.value)} disabled={!!editingId} />
            </div>
            <div className="form-group">
              <label htmlFor="role-display">Display Name</label>
              <input id="role-display" value={formDisplayName} onChange={(e) => setFormDisplayName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="role-desc">Description</label>
              <input id="role-desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Permissions</label>
              {PERM_GROUPS.map((group) => (
                <div key={group} className="perm-group">
                  <h4 className="perm-group__title">{group}</h4>
                  {allPerms.filter((p) => p.startsWith(group + '.')).map((perm) => (
                    <label key={perm} className="perm-row">
                      <input
                        type="checkbox"
                        checked={formPerms.includes(perm)}
                        onChange={() => togglePerm(perm)}
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn--secondary" onClick={resetForm}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!formName || !formDisplayName || formPerms.length === 0 || createMut.isPending || updateMut.isPending}
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
    </div>
  );
}

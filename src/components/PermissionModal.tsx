import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './Modal';
import { api } from '../lib/api';
import type { Role } from '../types';

interface PermissionModalProps {
  open: boolean;
  mode: 'user' | 'role';
  userId?: string;
  roleId?: string;
  onClose: () => void;
  onSave?: () => void;
}

interface UserPermission {
  name: string;
  displayName: string;
  group: string;
  isGranted: boolean;
  source: 'role-default' | 'direct-grant' | 'none';
}

const PERM_GROUPS = ['Events', 'Tags', 'RSVPs', 'Users'] as const;

const GROUP_EMOJIS: Record<string, string> = {
  Events: '🎵',
  Tags: '🏷️',
  RSVPs: '💌',
  Users: '👥',
};

const ALL_PERMISSIONS = [
  'Events.View', 'Events.Create', 'Events.Edit', 'Events.Delete',
  'Tags.View', 'Tags.Create', 'Tags.Edit', 'Tags.Delete',
  'RSVPs.View', 'RSVPs.Create', 'RSVPs.Edit', 'RSVPs.Manage', 'RSVPs.Cancel',
  'Users.View', 'Users.Manage',
];

export function PermissionModal({ open, mode, userId, roleId, onClose, onSave }: PermissionModalProps) {
  const queryClient = useQueryClient();
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const prevOpenRef = useRef(false);

  const { data: userPerms } = useQuery<UserPermission[]>({
    queryKey: ['user-permissions', userId],
    queryFn: () => api.get<{ result: UserPermission[] }>(`/api/permissions/user/${userId}`).then(r => r.result),
    enabled: open && mode === 'user' && !!userId,
  });

  const { data: role } = useQuery<Role>({
    queryKey: ['role', roleId],
    queryFn: () => api.get<{ result: Role }>(`/api/roles/${roleId}`).then(r => r.result),
    enabled: open && mode === 'role' && !!roleId,
  });

  const initialPerms = useMemo(() => {
    if (mode === 'user' && userPerms) {
      return userPerms.filter(p => p.source === 'direct-grant').map(p => p.name);
    }
    if (mode === 'role' && role) {
      return [...role.permissionNames];
    }
    return [];
  }, [mode, userPerms, role]);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelectedPerms(initialPerms);
    }
    prevOpenRef.current = open;
  }, [open, initialPerms]);

  const grantMut = useMutation({
    mutationFn: (perm: string) => api.post('/api/permissions/grant', { userId, permissionName: perm }),
  });

  const revokeMut = useMutation({
    mutationFn: (perm: string) => api.post('/api/permissions/revoke', { userId, permissionName: perm }),
  });

  const updateRoleMut = useMutation({
    mutationFn: (data: { permissionNames: string[] }) => api.put(`/api/roles/${roleId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onSave?.();
      onClose();
    },
  });

  function togglePerm(perm: string) {
    setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  }

  function handleSave() {
    if (mode === 'user' && userId) {
      const currentDirectGrants = userPerms?.filter(p => p.source === 'direct-grant').map(p => p.name) || [];
      const toGrant = selectedPerms.filter(p => !currentDirectGrants.includes(p));
      const toRevoke = currentDirectGrants.filter(p => !selectedPerms.includes(p));

      Promise.all([
        ...toGrant.map(p => grantMut.mutateAsync(p)),
        ...toRevoke.map(p => revokeMut.mutateAsync(p)),
      ]).then(() => {
        queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
        onSave?.();
        onClose();
      });
    } else if (mode === 'role' && roleId) {
      updateRoleMut.mutate({ permissionNames: selectedPerms });
    }
  }

  function isPermissionDisabled(perm: string): boolean {
    if (mode === 'role') return false;
    if (!userPerms) return false;
    const permData = userPerms.find(p => p.name === perm);
    return permData?.source === 'role-default';
  }

  function isPermissionChecked(perm: string): boolean {
    if (mode === 'user' && userPerms) {
      const permData = userPerms.find(p => p.name === perm);
      return permData?.isGranted || false;
    }
    return selectedPerms.includes(perm);
  }

  const isSaving = grantMut.isPending || revokeMut.isPending || updateRoleMut.isPending;

  return (
    <Modal
      open={open}
      title={mode === 'user' ? 'Manage User Permissions' : 'Edit Role Permissions'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="stack-4">
        {mode === 'user' && userPerms && (
          <p className="text-sm text-muted-foreground">
            Role-based permissions are read-only. Direct grants can be toggled.
          </p>
        )}
        {mode === 'role' && role && (
          <p className="text-sm text-muted-foreground">
            Editing permissions for role: <strong>{role.displayName}</strong>
          </p>
        )}
        {PERM_GROUPS.map(group => (
          <div key={group} className="perm-group">
            <h4 className="perm-group__title">{GROUP_EMOJIS[group]} {group}</h4>
            {ALL_PERMISSIONS.filter(p => p.startsWith(group + '.')).map(perm => {
              const disabled = isPermissionDisabled(perm);
              const checked = isPermissionChecked(perm);
              const shortName = perm.split('.')[1];
              return (
                <div key={perm} className="perm-row">
                  <label className="perm-check">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => togglePerm(perm)}
                    />
                    <span>{shortName}</span>
                  </label>
                  {mode === 'user' && disabled && (
                    <span className="perm-role-badge">role</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Modal>
  );
}

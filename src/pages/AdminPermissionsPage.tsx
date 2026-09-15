import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PermRow } from '../components/PermRow';
import { ConfirmModal } from '../components/ConfirmModal';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  roleName: string;
  isActive: boolean;
}

interface PermData {
  name: string;
  displayName: string;
  group: string;
  isGranted: boolean;
  source?: 'role-default' | 'direct-grant' | 'none';
}

interface UsersResponse {
  result: UserData[];
}

interface PermsResponse {
  result: PermData[];
}

const PERM_GROUPS = ['Events', 'Tags', 'RSVPs', 'Users'];

export function AdminPermissionsPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [confirmGrant, setConfirmGrant] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<UsersResponse>('/api/users'),
  });

  const { data: permsData, isLoading } = useQuery({
    queryKey: ['permissions', selectedUserId],
    queryFn: () => api.get<PermsResponse>(`/api/permissions/user/${selectedUserId}`),
    enabled: !!selectedUserId,
  });

  const grantMutation = useMutation({
    mutationFn: (permissionName: string) =>
      api.post('/api/permissions/grant', { userId: selectedUserId, permissionName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', selectedUserId] });
      setConfirmGrant(null);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (permissionName: string) =>
      api.post('/api/permissions/revoke', { userId: selectedUserId, permissionName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', selectedUserId] });
      setConfirmRevoke(null);
    },
  });

  const users = usersData?.result || [];
  const perms = permsData?.result || [];
  const selectedUser = users.find((u) => u.id === selectedUserId);
  const effectiveCount = perms.filter((p) => p.isGranted).length;
  const directGrantCount = perms.filter((p) => p.source === 'direct-grant').length;
  const deniedCount = perms.filter((p) => !p.isGranted).length;

  const grouped = PERM_GROUPS.map((group) => ({
    group,
    perms: perms.filter((p) => p.group === group),
  }));

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'Permissions' }]} />

      <header className="page-doc">
        <span className="washi page-doc__tape washi--shu" aria-hidden="true" />
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">手帳</span>
        <div className="page-doc__head">
          <p className="page-doc__overline">Admin · 手帳</p>
          <h1 className="page-doc__title">Permissions</h1>
          {selectedUser && (
            <p className="page-doc__sub">{selectedUser.displayName} · {selectedUser.email} · Role: {selectedUser.roleName}</p>
          )}
        </div>
        <div className="page-doc__actions">
          <label className="field__label" htmlFor="user-switch">Switch user</label>
          <select
            id="user-switch"
            className="select select--inline"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.displayName} · {u.roleName}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="stats-wrap" style={{ marginTop: 'var(--space-4)' }}>
        <div className="stat-row">
          <div className="stat stat--capacity">
            <span className="stat__label">Effective</span>
            <span className="stat__value tnum">{effectiveCount}</span>
          </div>
          <div className="stat stat--going">
            <span className="stat__label">Direct grants</span>
            <span className="stat__value tnum">{directGrantCount}</span>
          </div>
          <div className="stat stat--guests">
            <span className="stat__label">Denied</span>
            <span className="stat__value tnum">{deniedCount}</span>
          </div>
        </div>
      </div>

      <div className="cache-note ledger-note" role="note" style={{ marginTop: 'var(--space-4)' }}>
        Changes may take up to 5 minutes to apply (permission cache).
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Loading…</p>
      ) : (
        <div className="ledger">
          {grouped.map(({ group, perms: groupPerms }) => (
            <section key={group} className="ledger-group" aria-label={`${group} permissions`}>
              <div className="ledger-group__head">
                <span>{group} ({groupPerms.length})</span>
              </div>
              <div className="perm-group">
                {groupPerms.map((p) => (
                  <PermRow
                    key={p.name}
                    permission={p}
                    onGrant={(name) => setConfirmGrant(name)}
                    onRevoke={(name) => setConfirmRevoke(name)}
                    loading={grantMutation.isPending || revokeMutation.isPending}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmGrant}
        title={`Grant ${confirmGrant}?`}
        body={`This will grant ${confirmGrant} to ${selectedUser?.displayName || 'the user'}.`}
        confirmLabel="Grant"
        onConfirm={() => confirmGrant && grantMutation.mutate(confirmGrant)}
        onCancel={() => setConfirmGrant(null)}
      />
      <ConfirmModal
        open={!!confirmRevoke}
        title={`Revoke ${confirmRevoke}?`}
        body={`This will revoke ${confirmRevoke} from ${selectedUser?.displayName || 'the user'}.`}
        confirmLabel="Revoke"
        danger
        onConfirm={() => confirmRevoke && revokeMutation.mutate(confirmRevoke)}
        onCancel={() => setConfirmRevoke(null)}
      />
    </div>
  );
}

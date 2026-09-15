interface PermData {
  name: string;
  displayName: string;
  group: string;
  isGranted: boolean;
}

interface PermRowProps {
  permission: PermData;
  onGrant?: (name: string) => void;
  onRevoke?: (name: string) => void;
  loading?: boolean;
}

export function PermRow({ permission, onGrant, onRevoke, loading }: PermRowProps) {
  return (
    <div className="perm-row">
      <div className="perm-row__main">
        <span className="perm-name">{permission.name}</span>
        <div className="perm-meta">
          <span className={`perm-state ${permission.isGranted ? 'perm-state--on' : 'perm-state--off'}`}>
            {permission.isGranted ? 'Effective' : 'Denied'}
          </span>
        </div>
      </div>
      <div className="perm-action">
        {permission.isGranted && onRevoke && (
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => onRevoke(permission.name)}
            disabled={loading}
          >
            Revoke
          </button>
        )}
        {!permission.isGranted && onGrant && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => onGrant(permission.name)}
            disabled={loading}
          >
            Grant
          </button>
        )}
        {!permission.isGranted && !onGrant && (
          <span className="perm-source">—</span>
        )}
      </div>
    </div>
  );
}

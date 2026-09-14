import { Link } from 'react-router-dom'
import type { UserDto } from '@/types'
import { UserAvatar } from '@/components/data-display/UserAvatar'
import { fmtDate } from '@/lib/format'

interface UserTableRowProps {
  user: UserDto
  canManage: boolean
  onEdit(): void
  onDeactivate(): void
}

export function UserTableRow({ user, canManage, onEdit, onDeactivate }: UserTableRowProps) {
  return (
    <tr>
      <td data-label="User">
        <span className="guestbook-table__guest">
          <UserAvatar name={user.displayName} size={30} decorative />
          <span className="table-punch__guest">
            <span className="name nowrap">{user.displayName}</span>
          </span>
        </span>
      </td>
      <td data-label="Email">{user.email}</td>
      <td data-label="Role">{user.role}</td>
      <td data-label="Status">
        <span className={user.isActive ? 'badge badge--published' : 'badge badge--cancelled'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td data-label="Created">
        {user.createdAt ? (
          <time dateTime={user.createdAt}>{fmtDate(user.createdAt)}</time>
        ) : (
          <span className="tertiary">—</span>
        )}
      </td>
      <td data-label="Actions">
        <span className="cluster">
          <Link className="btn btn--secondary btn--sm" to={`/admin/users/${user.id}/permissions`}>
            Permissions
          </Link>
          {canManage ? (
            <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
              Edit
            </button>
          ) : null}
          {canManage && user.isActive ? (
            <button type="button" className="btn btn--danger btn--sm" onClick={onDeactivate}>
              Deactivate
            </button>
          ) : null}
        </span>
      </td>
    </tr>
  )
}

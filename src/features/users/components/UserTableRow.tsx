import { Link } from 'react-router-dom'
import type { UserDto } from '@/types'
import { UserAvatar } from '@/components/data-display/UserAvatar'

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
        <span className="cluster">
          <UserAvatar name={user.displayName} size={30} decorative />
          {user.displayName}
        </span>
      </td>
      <td data-label="Email">{user.email}</td>
      <td data-label="Role">{user.role}</td>
      <td data-label="Status">{user.isActive ? 'Active' : 'Inactive'}</td>
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

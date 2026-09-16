import { Icon } from '@/components/icons/Icon'
import { isBuiltInRole } from '@/lib/permissions'
import type { RoleDto } from '@/types'

interface RoleTableRowProps {
  role: RoleDto
  onEdit(): void
  onDelete(): void
}

export function RoleTableRow({ role, onEdit, onDelete }: RoleTableRowProps) {
  return (
    <tr>
      <td data-label="Role">
        <strong>{role.displayName}</strong> <span className="muted">{role.name}</span>
      </td>
      <td data-label="Permissions" className="tnum">
        {role.permissionNames.length}
      </td>
      <td data-label="Users" className="tnum">
        {role.userCount}
      </td>
      <td data-label="Actions">
        <div className="cluster-3">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
            <Icon name="edit" size={16} />
            Edit
          </button>
          {isBuiltInRole(role.name) ? null : (
            <button type="button" className="btn btn--danger btn--sm" onClick={onDelete}>
              <Icon name="trash" size={16} />
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

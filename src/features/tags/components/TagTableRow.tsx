import { TagChip } from '@/components/data-display/TagChip'
import { fmtDate } from '@/lib/format'
import type { TagDto } from '@/types'

interface TagTableRowProps {
  tag: TagDto
  canEdit: boolean
  canDelete: boolean
  onEdit(): void
  onDelete(): void
}

export function TagTableRow({ tag, canEdit, canDelete, onEdit, onDelete }: TagTableRowProps) {
  return (
    <tr>
      <td data-label="Name">
        <TagChip tag={tag} />
      </td>
      <td data-label="Colour" className="tnum">
        {tag.color.toUpperCase()}
      </td>
      <td data-label="Created">
        <time dateTime={tag.createdAt}>{fmtDate(tag.createdAt)}</time>
      </td>
      <td data-label="Actions">
        <span className="cluster">
          {canEdit ? (
            <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
              Edit
            </button>
          ) : null}
          {canDelete ? (
            <button type="button" className="btn btn--danger btn--sm" onClick={onDelete}>
              Delete
            </button>
          ) : null}
        </span>
      </td>
    </tr>
  )
}

import { useState } from 'react'
import type { TagDto } from '@/types'
import { useTags } from '@/features/tags/useTags'
import { useCreateTag } from '@/features/tags/useCreateTag'
import { useUpdateTag } from '@/features/tags/useUpdateTag'
import { useDeleteTag } from '@/features/tags/useDeleteTag'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { PageDoc } from '@/components/data-display/PageDoc'
import { TagChip } from '@/components/data-display/TagChip'
import { TagFormModal } from '@/features/tags/components/TagFormModal'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'

export default function TagAdminPage() {
  const { hasPermission } = useAuth()
  const tags = useTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const [editing, setEditing] = useState<TagDto | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<TagDto | null>(null)

  const canCreate = hasPermission(EventNestPermissions.Tags.Create)
  const canEdit = hasPermission(EventNestPermissions.Tags.Edit)
  const canDelete = hasPermission(EventNestPermissions.Tags.Delete)

  return (
    <div className="stack-6">
      <PageDoc
        title="Tags"
        overline="Admin"
        kanji="手帳"
        tapeVariant="shu"
        subtitle={`${tags.data?.length ?? 0} tags`}
        actions={
          canCreate ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              + Create tag
            </button>
          ) : null
        }
      />
      {tags.isLoading ? <SkeletonRows count={5} /> : null}
      {tags.isError ? <ErrorState onRetry={() => void tags.refetch()} /> : null}
      {tags.isSuccess && (tags.data?.length ?? 0) === 0 ? (
        <EmptyState title="No tags yet." body="Create the first tag for events." />
      ) : null}
      <div className="ledger">
        {(tags.data ?? []).map((tag) => (
          <div key={tag.id} className="perm-row">
            <TagChip tag={tag} md />
            <span className="tnum">{tag.color}</span>
            <time dateTime={tag.createdAt}>{tag.createdAt.slice(0, 10)}</time>
            <span className="cluster">
              {canEdit ? (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    setEditing(tag)
                    setFormOpen(true)
                  }}
                >
                  Edit
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => setDeleting(tag)}
                >
                  Delete
                </button>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      <TagFormModal
        open={formOpen}
        tag={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input) => {
          if (editing) await updateTag.mutateAsync({ id: editing.id, body: input })
          else await createTag.mutateAsync(input)
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this tag?"
        body="Events keep a denormalized copy of the tag name; deleting it here does not rewrite those copies."
        confirmLabel="Delete tag"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) void deleteTag.mutateAsync(deleting.id)
          setDeleting(null)
        }}
      />
    </div>
  )
}

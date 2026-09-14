import { useState } from 'react'
import type { TagDto } from '@/types'
import { useTags } from '@/features/tags/useTags'
import { useCreateTag } from '@/features/tags/useCreateTag'
import { useUpdateTag } from '@/features/tags/useUpdateTag'
import { useDeleteTag } from '@/features/tags/useDeleteTag'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { Icon } from '@/components/icons/Icon'
import { PageDoc } from '@/components/data-display/PageDoc'
import { PunchTable } from '@/components/data-display/PunchTable'
import { TagFormModal } from '@/features/tags/components/TagFormModal'
import { TagTableRow } from '@/features/tags/components/TagTableRow'
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
  const rows = tags.data ?? []

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/users' }, { label: 'Tags' }]} />
      <PageDoc
        title="Tags"
        overline="Admin"
        kanji="手帳"
        tapeVariant="shu"
        subtitle={`${rows.length} tags`}
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
              <Icon name="plus" size={18} />
              Create tag
            </button>
          ) : null
        }
      />
      {tags.isLoading ? <SkeletonRows count={5} /> : null}
      {tags.isError ? <ErrorState onRetry={() => void tags.refetch()} /> : null}
      {tags.isSuccess && rows.length === 0 ? (
        <EmptyState title="No tags yet." body="Create the first tag for events." />
      ) : null}
      {rows.length > 0 ? (
        <PunchTable
          caption="Tags"
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'colour', header: 'Colour' },
            { key: 'created', header: 'Created' },
            { key: 'actions', header: 'Actions' },
          ]}
        >
          {rows.map((tag) => (
            <TagTableRow
              key={tag.id}
              tag={tag}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={() => {
                setEditing(tag)
                setFormOpen(true)
              }}
              onDelete={() => setDeleting(tag)}
            />
          ))}
        </PunchTable>
      ) : null}
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

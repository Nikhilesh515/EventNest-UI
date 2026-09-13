import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useToast } from '@/app/providers/ToastProvider'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { AccessDenied } from '@/components/states/AccessDenied'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { EventForm } from '@/features/events/components/EventForm'
import { useEvent } from '@/features/events/useEvent'
import { useEventStatusMutations } from '@/features/events/useEventStatusMutations'
import { useUpdateEvent } from '@/features/events/useUpdateEvent'
import { TagQuickCreateModal } from '@/features/tags/components/TagQuickCreateModal'
import { useCreateTag } from '@/features/tags/useCreateTag'
import { useTags } from '@/features/tags/useTags'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'

export default function EventEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()
  const { push } = useToast()
  const eventQuery = useEvent(id)
  const tags = useTags()
  const updateEvent = useUpdateEvent(id)
  const statusMutations = useEventStatusMutations(id)
  const createTag = useCreateTag()
  const [quickOpen, setQuickOpen] = useState(false)

  if (eventQuery.isLoading) return <DetailSkeleton />
  if (!eventQuery.data) return null
  const event = eventQuery.data
  if (!hasPermission(EventNestPermissions.Events.Edit) || user?.id !== event.organizerId) {
    return (
      <AccessDenied
        crumbs={[{ label: 'My Events', href: '/my-events' }, { label: 'Edit event' }]}
      />
    )
  }

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'My Events', href: '/my-events' }, { label: 'Edit event' }]} />
      <EventForm
        initial={event}
        tags={tags.data ?? []}
        tagsLoading={tags.isLoading}
        canCreateTag={hasPermission(EventNestPermissions.Tags.Create)}
        submitting={updateEvent.isPending}
        onQuickCreateTag={() => setQuickOpen(true)}
        onCancel={() => navigate(`/events/${id}`)}
        onNotify={push}
        onSubmit={async (values, publish) => {
          await updateEvent.mutateAsync(values)
          if (publish && event.status !== 'Published') {
            await statusMutations.publish()
            push({
              kind: 'success',
              title: 'Published!',
              body: 'The daruma has both eyes now. ●●',
            })
          }
          navigate(`/events/${id}`)
        }}
      />
      <TagQuickCreateModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        onCreate={async (input) => {
          await createTag.mutateAsync(input)
        }}
      />
    </div>
  )
}

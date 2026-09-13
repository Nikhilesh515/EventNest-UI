import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useToast } from '@/app/providers/ToastProvider'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { EventForm } from '@/features/events/components/EventForm'
import { useCreateEvent } from '@/features/events/useCreateEvent'
import { TagQuickCreateModal } from '@/features/tags/components/TagQuickCreateModal'
import { useCreateTag } from '@/features/tags/useCreateTag'
import { useTags } from '@/features/tags/useTags'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'

export default function EventCreatePage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const { push } = useToast()
  const tags = useTags()
  const createTag = useCreateTag()
  const createEvent = useCreateEvent()
  const [quickOpen, setQuickOpen] = useState(false)

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'My Events', href: '/my-events' }, { label: 'New event' }]} />
      <EventForm
        tags={tags.data ?? []}
        tagsLoading={tags.isLoading}
        canCreateTag={hasPermission(EventNestPermissions.Tags.Create)}
        submitting={createEvent.isPending}
        onQuickCreateTag={() => setQuickOpen(true)}
        onCancel={() => navigate('/my-events')}
        onNotify={push}
        onSubmit={async (values, publish) => {
          const created = await createEvent.mutateAsync({ values, publish })
          push({
            kind: 'success',
            title: publish ? 'Published! The daruma has both eyes now. ●●' : 'Saved as draft',
            body: publish ? 'Your event is on the table.' : 'Your daruma has one eye painted.',
          })
          navigate(`/events/${created.id}`)
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

import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EventForm, type EventFormMode } from '../components/EventForm';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface TagsResponse {
  result: EventTag[];
}

interface CreateEventResponse {
  result: { id: string };
}

interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  visibility: 'Public' | 'Private';
  tagIds: string[];
}

export function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canCreateTag = ['Admin', 'SuperAdmin', 'Moderator'].includes(user?.role || '');

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagsResponse>('/api/tags'),
  });

  const createMutation = useMutation({
    mutationFn: async ({ values, mode }: { values: EventFormValues; mode: EventFormMode }) => {
      const created = await api.post<CreateEventResponse>('/api/events', values);
      if (mode === 'publish') {
        await api.put(`/api/events/${created.result.id}/publish`, {});
      }
      return created;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${data.result.id}`);
    },
  });

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'My Events', href: '/my-events' }, { label: 'New event' }]} />

      <div className="clipboard">
        <span className="clipboard__clip" aria-hidden="true" />

        <header className="page-doc">
          <span className="washi page-doc__tape washi--yamabuki" aria-hidden="true" />
          <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">手帳</span>
          <div className="page-doc__head">
            <p className="page-doc__overline">MY EVENTS / NEW EVENT · 手帳</p>
            <h1 className="page-doc__title">Create an event</h1>
            <p className="page-doc__sub">Fill the card, then pick a sticker for the daruma.</p>
          </div>
        </header>

        <EventForm
          availableTags={tagsData?.result || []}
          loading={createMutation.isPending}
          canCreateTag={canCreateTag}
          onSubmit={(values, mode) => createMutation.mutate({ values, mode })}
          onCancel={() => navigate('/my-events')}
        />
      </div>
    </div>
  );
}

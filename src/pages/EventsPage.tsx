import { useEffect, useRef, useState } from 'react'

import { AppApiError } from '@/api/errors'
import { useToast } from '@/app/providers/ToastProvider'
import { Pager } from '@/components/data-display/Pager'
import { FilterDrawer } from '@/components/overlays/FilterDrawer'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { MosaicSkeleton } from '@/components/states/MosaicSkeleton'
import { SkeletonRows } from '@/components/states/SkeletonRows'
import { useAuth } from '@/features/auth/AuthContext'
import { EventListView } from '@/features/events/components/EventListView'
import { EventMosaic } from '@/features/events/components/EventMosaic'
import { EventSheetTools } from '@/features/events/components/EventSheetTools'
import { EventsHero } from '@/features/events/components/EventsHero'
import { useEventFilters } from '@/features/events/useEventFilters'
import { useEventCount } from '@/features/events/useEventCount'
import { useEvents } from '@/features/events/useEvents'
import { useTags } from '@/features/tags/useTags'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDisclosure } from '@/hooks/useDisclosure'
import { EventNestPermissions } from '@/lib/permissions'
import { readStorage, STORAGE_KEYS, writeStorage } from '@/lib/storage'

type ViewMode = 'collage' | 'list'

export default function EventsPage() {
  const { hasPermission } = useAuth()
  const { push } = useToast()
  const { filters, update } = useEventFilters()
  const tags = useTags()
  const events = useEvents(filters)
  const eventCount = useEventCount()
  const filtersDrawer = useDisclosure()
  const filtersTriggerRef = useRef<HTMLButtonElement>(null)
  const [search, setSearch] = useState(filters.q)
  const debouncedSearch = useDebouncedValue(search, 300)
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (readStorage(STORAGE_KEYS.viewMode) as ViewMode | null) ?? 'collage',
  )

  useEffect(() => {
    if (debouncedSearch !== filters.q) update({ q: debouncedSearch }, { replace: true })
  }, [debouncedSearch, filters.q, update])

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode)
    writeStorage(STORAGE_KEYS.viewMode, mode)
    update({ pageSize: mode === 'collage' ? 9 : 10 })
  }

  async function shareLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      push({
        kind: 'success',
        title: 'Link copied',
        body: 'The whole spread is one paste away.',
      })
    } catch {
      push({ kind: 'info', title: 'Copy this link', body: url })
    }
  }

  const showing = events.page
  const pageEvents = showing.items
  const hasActiveFilters =
    filters.q !== '' ||
    filters.tagIds.length > 0 ||
    filters.visibility !== 'all' ||
    filters.status !== 'all'

  return (
    <>
      <EventsHero
        total={eventCount.data ?? showing.total}
        value={search}
        onChange={setSearch}
        onSearch={(value) => {
          setSearch(value)
          update({ q: value })
        }}
      />

      <EventSheetTools
        filters={filters}
        resultCount={showing.total}
        sheet={showing.page}
        sheets={showing.pages}
        viewMode={viewMode}
        onTimeframe={(value) => update({ timeframe: value })}
        onSort={(value) => update({ sort: value })}
        onViewMode={changeViewMode}
        onOpenFilters={filtersDrawer.open}
        onShare={() => void shareLink()}
      />

      <div id="events-results" className="collection" aria-busy={events.isLoading}>
        {events.isLoading ? (
          viewMode === 'collage' ? (
            <div className="mosaic">
              <MosaicSkeleton />
            </div>
          ) : (
            <SkeletonRows count={4} />
          )
        ) : events.isError ? (
          <ErrorState
            title="We couldn't load the spread."
            body={
              events.error instanceof AppApiError
                ? events.error.message
                : "The stall didn't answer in time. Give it another go."
            }
            mascot="koi"
            meta={`Error code: ${events.error instanceof AppApiError ? events.error.status : 502}`}
            onRetry={() => void events.refetch()}
          />
        ) : pageEvents.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              title="The stall is quiet."
              body="No events match your filters."
              cta={{
                label: 'Paint the other eye · Clear filters',
                onClick: () =>
                  update({
                    q: '',
                    tagIds: [],
                    visibility: 'all',
                    status: 'all',
                    timeframe: 'upcoming',
                    sort: 'date-asc',
                  }),
              }}
            />
          ) : (
            <EmptyState
              title="The stall is quiet."
              body="No events are on the table yet."
              cta={
                hasPermission(EventNestPermissions.Events.Create)
                  ? { label: '+ Create your first event', to: '/events/create' }
                  : undefined
              }
            />
          )
        ) : viewMode === 'collage' ? (
          <EventMosaic events={pageEvents} pageSize={filters.pageSize} />
        ) : (
          <EventListView events={pageEvents} />
        )}
      </div>

      {!events.isLoading && !events.isError && pageEvents.length > 0 ? (
        <Pager
          page={showing.page}
          pages={showing.pages}
          total={showing.total}
          pageSize={filters.pageSize}
          sizeOptions={viewMode === 'collage' ? [9, 18] : [10, 25]}
          variant={viewMode === 'collage' ? 'sheet' : 'plain'}
          onPageChange={(page) => update({ page })}
          onPageSizeChange={(pageSize) => update({ pageSize })}
        />
      ) : null}

      <FilterDrawer
        open={filtersDrawer.isOpen}
        filters={filters}
        tags={tags.data ?? []}
        onApply={(next) => {
          update(next)
          filtersDrawer.close()
        }}
        onClear={() => {
          update({
            q: '',
            tagIds: [],
            visibility: 'all',
            status: 'all',
            timeframe: 'upcoming',
            sort: 'date-asc',
          })
          filtersDrawer.close()
        }}
        onClose={filtersDrawer.close}
        triggerRef={filtersTriggerRef}
      />
    </>
  )
}

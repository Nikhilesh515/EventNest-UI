import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { FEATURES } from '@/lib/features'
import type { EventStatus } from '@/types'

import { listEvents, listMyEvents } from './api'
import { eventKeys } from './queryKeys'

export function useMyEvents(status: EventStatus | 'all') {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: eventKeys.mine(status),
    queryFn: ({ signal }) =>
      FEATURES.myEventsEndpoint ? listMyEvents(signal) : listEvents({}, signal),
    enabled: Boolean(user),
  })

  const data = useMemo(() => query.data ?? [], [query.data])

  const mine = useMemo(
    () =>
      FEATURES.myEventsEndpoint ? data : data.filter((event) => event.organizerId === user?.id),
    [data, user?.id],
  )

  const counts = useMemo(
    () =>
      mine.reduce<Partial<Record<EventStatus, number>>>((acc, event) => {
        acc[event.status] = (acc[event.status] ?? 0) + 1
        return acc
      }, {}),
    [mine],
  )

  const filtered = useMemo(
    () => (status === 'all' ? mine : mine.filter((event) => event.status === status)),
    [mine, status],
  )

  return { ...query, data: filtered, counts }
}

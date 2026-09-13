import { useMemo } from 'react'

import { useAuth } from '@/features/auth/AuthContext'

import { useUserRsvps } from './useUserRsvps'

export function useMyRsvp(eventId: string) {
  const { user } = useAuth()
  const query = useUserRsvps(user?.id ?? '')
  const data = useMemo(
    () => (query.data ?? []).find((rsvp) => rsvp.eventId === eventId) ?? null,
    [query.data, eventId],
  )
  return { ...query, data }
}

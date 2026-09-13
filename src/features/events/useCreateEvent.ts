import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateEventRequest } from '@/types'

import { createEvent, publishEvent } from './api'
import { eventKeys } from './queryKeys'

interface CreateEventInput {
  values: CreateEventRequest
  publish?: boolean
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ values, publish }: CreateEventInput) => {
      const created = await createEvent(values)
      return publish ? publishEvent(created.id) : created
    },
    onSuccess: (event) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event)
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: eventKeys.mine() })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelEvent, completeEvent, deleteEvent, publishEvent } from './api'
import { eventKeys } from './queryKeys'

export function useEventActions() {
  const queryClient = useQueryClient()

  const invalidate = (id: string) => {
    void queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
    void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: [...eventKeys.all, 'mine'] })
  }

  const publish = useMutation({
    mutationFn: (id: string) => publishEvent(id),
    onSuccess: (_data, id) => invalidate(id),
  })
  const cancel = useMutation({
    mutationFn: (id: string) => cancelEvent(id),
    onSuccess: (_data, id) => invalidate(id),
  })
  const complete = useMutation({
    mutationFn: (id: string) => completeEvent(id),
    onSuccess: (_data, id) => invalidate(id),
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (_data, id) => invalidate(id),
  })

  return {
    publish: publish.mutateAsync,
    cancel: cancel.mutateAsync,
    complete: complete.mutateAsync,
    remove: remove.mutateAsync,
  }
}

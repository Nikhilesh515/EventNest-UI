import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelEvent, completeEvent, publishEvent } from './api'
import { eventKeys } from './queryKeys'

export function useEventStatusMutations(id: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
    void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: eventKeys.mine() })
  }

  const publish = useMutation({ mutationFn: () => publishEvent(id), onSuccess: invalidate })
  const cancel = useMutation({ mutationFn: () => cancelEvent(id), onSuccess: invalidate })
  const complete = useMutation({ mutationFn: () => completeEvent(id), onSuccess: invalidate })

  return {
    publish: () => publish.mutateAsync(),
    cancel: () => cancel.mutateAsync(),
    complete: () => complete.mutateAsync(),
    isPending: publish.isPending || cancel.isPending || complete.isPending,
  }
}

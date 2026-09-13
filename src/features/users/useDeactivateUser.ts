import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deactivateUser } from './api'
import { userKeys } from './queryKeys'

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { assignUserRole } from './api'
import { userKeys } from './queryKeys'

export function useAssignUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => assignUserRole(id, roleId),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all })
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
    },
  })
}

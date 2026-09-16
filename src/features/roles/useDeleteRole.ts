import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteRole } from './api'
import { roleKeys } from './queryKeys'

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

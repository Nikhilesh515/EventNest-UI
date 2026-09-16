import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateRoleRequest } from '@/types'

import { updateRole } from './api'
import { roleKeys } from './queryKeys'

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRoleRequest }) => updateRole(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

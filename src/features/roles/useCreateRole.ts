import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateRoleRequest } from '@/types'

import { createRole } from './api'
import { roleKeys } from './queryKeys'

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRoleRequest) => createRole(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

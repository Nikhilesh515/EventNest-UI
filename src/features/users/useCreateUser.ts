import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateUserRequest } from '@/types'

import { createUser } from './api'
import { userKeys } from './queryKeys'

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserRequest) => createUser(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

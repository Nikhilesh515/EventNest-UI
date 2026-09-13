import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateUserRequest } from '@/types'

import { updateUser } from './api'
import { userKeys } from './queryKeys'

interface UpdateUserInput {
  id: string
  body: UpdateUserRequest
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: UpdateUserInput) => updateUser(id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: userKeys.me() })
      void queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

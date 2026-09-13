import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateTagRequest } from '@/types'

import { updateTag } from './api'
import { tagKeys } from './queryKeys'

interface UpdateTagInput {
  id: string
  body: UpdateTagRequest
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: UpdateTagInput) => updateTag(id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.list() })
      void queryClient.invalidateQueries({ queryKey: tagKeys.detail(id) })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateTagRequest } from '@/types'

import { createTag } from './api'
import { tagKeys } from './queryKeys'

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTagRequest) => createTag(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.list() })
    },
  })
}

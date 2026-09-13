import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteTag } from './api'
import { tagKeys } from './queryKeys'

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.list() })
    },
  })
}

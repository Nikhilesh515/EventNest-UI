import { useQuery } from '@tanstack/react-query'

import { listUsers } from './api'
import { userKeys } from './queryKeys'

export function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: userKeys.list(page, pageSize),
    queryFn: ({ signal }) => listUsers(page, pageSize, signal),
    placeholderData: (previous) => previous,
  })
}

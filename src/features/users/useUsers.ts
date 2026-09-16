import { useQuery } from '@tanstack/react-query'

import { listUsers } from './api'
import type { ListUsersParams } from './api'
import { userKeys } from './queryKeys'

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => listUsers(params, signal),
    placeholderData: (previous) => previous,
  })
}

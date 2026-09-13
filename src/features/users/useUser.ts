import { useQuery } from '@tanstack/react-query'

import { getUser } from './api'
import { userKeys } from './queryKeys'

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => getUser(id, signal),
    enabled: Boolean(id),
  })
}

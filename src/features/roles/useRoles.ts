import { useQuery } from '@tanstack/react-query'

import { listRoles } from './api'
import { roleKeys } from './queryKeys'

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: ({ signal }) => listRoles(signal),
  })
}

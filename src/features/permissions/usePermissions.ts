import { useQuery } from '@tanstack/react-query'

import { listPermissions } from './api'
import { permissionKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60_000

export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.catalog(),
    queryFn: ({ signal }) => listPermissions(signal),
    staleTime: FIVE_MINUTES,
  })
}

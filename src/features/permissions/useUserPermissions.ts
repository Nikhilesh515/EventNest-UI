import { useQuery } from '@tanstack/react-query'

import { getUserPermissions } from './api'
import { permissionKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60_000

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: permissionKeys.user(userId),
    queryFn: async ({ signal }) => {
      const permissions = await getUserPermissions(userId, signal)
      return permissions.filter((permission) => permission.isGranted)
    },
    enabled: Boolean(userId),
    staleTime: FIVE_MINUTES,
  })
}

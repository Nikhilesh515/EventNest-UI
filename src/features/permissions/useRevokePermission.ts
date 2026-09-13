import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revokePermission } from './api'
import { permissionKeys } from './queryKeys'

interface RevokeInput {
  permissionName: string
}

/** @requires BP-01 - /api/permissions/** is not routed at the gateway today. */
export function useRevokePermission(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ permissionName }: RevokeInput) => revokePermission({ userId, permissionName }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) })
    },
  })
}

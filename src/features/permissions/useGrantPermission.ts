import { useMutation, useQueryClient } from '@tanstack/react-query'

import { grantPermission } from './api'
import { permissionKeys } from './queryKeys'

interface GrantInput {
  permissionName: string
  expiresAt?: string | null
}

/** @requires BP-01 - /api/permissions/** is not routed at the gateway today. */
export function useGrantPermission(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ permissionName, expiresAt }: GrantInput) =>
      grantPermission({ userId, permissionName, expiresAt: expiresAt ?? null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) })
    },
  })
}

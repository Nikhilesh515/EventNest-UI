import { apiClient } from '@/api/client'
import { PERMISSIONS } from '@/api/endpoints'
import type { GrantPermissionRequestDto, PermissionDto, RevokePermissionRequestDto } from '@/types'

/** @requires BP-01 — /api/permissions/** is not routed at the gateway today. */
export async function listPermissions(signal?: AbortSignal): Promise<PermissionDto[]> {
  const { data } = await apiClient.get<PermissionDto[]>(PERMISSIONS.catalog, { signal })
  return data
}

/** @requires BP-01 */
export async function getUserPermissions(
  userId: string,
  signal?: AbortSignal,
): Promise<PermissionDto[]> {
  const { data } = await apiClient.get<PermissionDto[]>(PERMISSIONS.byUser(userId), { signal })
  return data
}

/** @requires BP-01 */
export async function grantPermission(body: GrantPermissionRequestDto): Promise<PermissionDto> {
  const { data } = await apiClient.post<PermissionDto>(PERMISSIONS.grant, body)
  return data
}

/** @requires BP-01 */
export async function revokePermission(body: RevokePermissionRequestDto): Promise<void> {
  await apiClient.post(PERMISSIONS.revoke, body)
}

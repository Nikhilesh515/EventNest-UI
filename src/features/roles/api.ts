import { apiClient } from '@/api/client'
import { ROLES } from '@/api/endpoints'
import type { CreateRoleRequest, RoleDto, UpdateRoleRequest } from '@/types'

export async function listRoles(signal?: AbortSignal): Promise<RoleDto[]> {
  const { data } = await apiClient.get<RoleDto[]>(ROLES.list, { signal })
  return data
}

export async function getRole(id: string): Promise<RoleDto> {
  const { data } = await apiClient.get<RoleDto>(ROLES.byId(id))
  return data
}

export async function createRole(body: CreateRoleRequest): Promise<RoleDto> {
  const { data } = await apiClient.post<RoleDto>(ROLES.create, body)
  return data
}

export async function updateRole(id: string, body: UpdateRoleRequest): Promise<RoleDto> {
  const { data } = await apiClient.put<RoleDto>(ROLES.byId(id), body)
  return data
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(ROLES.byId(id))
}

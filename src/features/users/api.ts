import { apiClient } from '@/api/client'
import { USERS } from '@/api/endpoints'
import type { UpdateUserRequest, UserDto } from '@/types'

interface ApiUserDto {
  id: string
  email: string
  displayName: string
  roleName: UserDto['role']
  isActive: boolean
}

function toUser(raw: ApiUserDto): UserDto {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.displayName,
    role: raw.roleName,
    isActive: raw.isActive,
    createdAt: null,
  }
}

export async function listUsers(page = 1, pageSize = 20, signal?: AbortSignal): Promise<UserDto[]> {
  const { data } = await apiClient.get<ApiUserDto[]>(USERS.list, {
    params: { page, pageSize },
    signal,
  })
  return data.map(toUser)
}

export async function getUser(id: string, signal?: AbortSignal): Promise<UserDto> {
  const { data } = await apiClient.get<ApiUserDto>(USERS.byId(id), { signal })
  return toUser(data)
}

export async function updateUser(id: string, body: UpdateUserRequest): Promise<UserDto> {
  const { data } = await apiClient.put<ApiUserDto>(USERS.byId(id), body)
  return toUser(data)
}

export async function deactivateUser(id: string): Promise<void> {
  await apiClient.delete(USERS.byId(id))
}

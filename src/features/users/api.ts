import { apiClient } from '@/api/client'
import { USERS } from '@/api/endpoints'
import type { CreateUserRequest, Page, UpdateUserRequest, UserDto } from '@/types'

interface ApiUserDto {
  id: string
  email: string
  displayName: string
  roleName: UserDto['role']
  roleId: string
  isActive: boolean
}

interface ApiPagedUsers {
  items: ApiUserDto[]
  total: number
  page: number
  size: number
  pages: number
}

function toUser(raw: ApiUserDto): UserDto {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.displayName,
    role: raw.roleName,
    roleId: raw.roleId,
    isActive: raw.isActive,
    createdAt: null,
  }
}

export interface ListUsersParams {
  page: number
  pageSize: number
  search?: string
  role?: string
}

export async function listUsers(params: ListUsersParams, signal?: AbortSignal): Promise<Page<UserDto>> {
  const { data } = await apiClient.get<ApiPagedUsers>(USERS.list, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      role: params.role,
    },
    signal,
  })

  return {
    items: data.items.map(toUser),
    total: data.total,
    page: data.page,
    size: data.size,
    pages: data.pages,
  }
}

export async function getUser(id: string, signal?: AbortSignal): Promise<UserDto> {
  const { data } = await apiClient.get<ApiUserDto>(USERS.byId(id), { signal })
  return toUser(data)
}

export async function updateUser(id: string, body: UpdateUserRequest): Promise<UserDto> {
  const { data } = await apiClient.put<ApiUserDto>(USERS.byId(id), body)
  return toUser(data)
}

export async function createUser(body: CreateUserRequest): Promise<UserDto> {
  const { data } = await apiClient.post<ApiUserDto>(USERS.list, body)
  return toUser(data)
}

export async function assignUserRole(id: string, roleId: string): Promise<UserDto> {
  const { data } = await apiClient.put<ApiUserDto>(USERS.role(id), { roleId })
  return toUser(data)
}

export async function deactivateUser(id: string): Promise<void> {
  await apiClient.delete(USERS.byId(id))
}

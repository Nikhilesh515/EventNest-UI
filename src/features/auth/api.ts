import { apiClient } from '@/api/client'
import { AUTH, USERS } from '@/api/endpoints'
import { toAuthResponse } from '@/types'
import type {
  AuthResponse,
  AuthResponseDto,
  LoginRequest,
  RegisterRequest,
  UserDto,
} from '@/types'

interface ApiUserDto {
  id: string
  email: string
  displayName: string
  roleName: UserDto['role']
  roleId: string
  isActive: boolean
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

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponseDto>(AUTH.login, body)
  return toAuthResponse({ ...data, user: toUser(data.user as unknown as ApiUserDto) })
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponseDto>(AUTH.register, body)
  return toAuthResponse({ ...data, user: toUser(data.user as unknown as ApiUserDto) })
}

export async function refresh(): Promise<void> {
  await apiClient.post(AUTH.refresh)
}

export async function logout(): Promise<void> {
  await apiClient.post(AUTH.logout, undefined, { withCredentials: true })
}

export async function getCurrentUser(): Promise<UserDto> {
  const { data } = await apiClient.get<ApiUserDto>(USERS.me)
  return toUser(data)
}

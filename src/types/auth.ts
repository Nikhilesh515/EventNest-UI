import type { UserDto, UserRole } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  displayName: string
  email: string
  password: string
}

export interface AuthResponseDto {
  accessToken: string
  expiresIn: number
  user: UserDto
}

export interface AuthResponse {
  user: UserDto
}

export interface SessionUser {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export function toAuthResponse(dto: AuthResponseDto): AuthResponse {
  return {
    user: dto.user,
  }
}

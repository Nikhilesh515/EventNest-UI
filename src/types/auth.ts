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

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  displayName: string
  email: string
  password: string
}

export interface RefreshRequestDto {
  refreshToken: string
}

export interface LogoutRequestDto {
  refreshToken: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: UserDto
  tokens: AuthTokens
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: number
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
    tokens: {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresIn: dto.expiresIn,
    },
  }
}

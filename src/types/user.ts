export type UserRole = 'User' | 'Organizer' | 'Moderator' | 'Admin' | 'SuperAdmin'

export interface UserDto {
  id: string
  displayName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string | null
}

export interface UpdateUserRequestDto {
  displayName: string
}

export interface UpdateUserRequest {
  displayName: string
}

export interface RegisterInput {
  displayName: string
  email: string
  password: string
}

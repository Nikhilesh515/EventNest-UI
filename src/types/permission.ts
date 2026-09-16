import type { UserDto } from './user'

export type PermissionGroupName = 'Events' | 'Tags' | 'RSVPs' | 'Users'

export interface PermissionDto {
  name: string
  displayName: string
  group: PermissionGroupName
  isGranted: boolean
}

export interface EffectivePermission {
  key: string
  roleHas: boolean
  effective: boolean
  source: 'role default' | 'direct grant' | 'direct deny' | '-'
  expiry: string | null
  overridden: boolean
}

export interface PermissionToggle {
  checked: boolean
  disabled?: boolean
  onChange(checked: boolean): void
}

export interface PermissionToggleSpec {
  isChecked(key: string): boolean
  setChecked(key: string, checked: boolean): void
  disabled?: boolean
}

export interface GrantPermissionRequestDto {
  userId: string
  permissionName: string
  expiresAt?: string | null
}

export interface RevokePermissionRequestDto {
  userId: string
  permissionName: string
}

export interface UserPermissionsResponse {
  user: UserDto
  permissions: EffectivePermission[]
}

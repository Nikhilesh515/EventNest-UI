export interface RoleDto {
  id: string
  name: string
  displayName: string
  description: string | null
  sortOrder: number
  userCount: number
  permissionNames: string[]
}

export interface CreateRoleRequest {
  name: string
  displayName: string
  description?: string | null
  sortOrder?: number
  permissionNames: string[]
}

export interface UpdateRoleRequest {
  displayName: string
  description?: string | null
  sortOrder?: number
  permissionNames: string[]
}

export interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  role: string;
  roleName?: string;
}

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  sortOrder: number;
  permissionNames: string[];
  userCount: number;
  createdAt: string;
}

export interface PaginatedUsers {
  items: UserDto[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

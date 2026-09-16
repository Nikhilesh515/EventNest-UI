import type { ListUsersParams } from './api'

export const userKeys = {
  all: ['users'] as const,
  list: (params: ListUsersParams) => [...userKeys.all, 'list', params] as const,
  me: () => [...userKeys.all, 'me'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export const userKeys = {
  all: ['users'] as const,
  list: (page: number, pageSize: number) => [...userKeys.all, 'list', { page, pageSize }] as const,
  me: () => [...userKeys.all, 'me'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

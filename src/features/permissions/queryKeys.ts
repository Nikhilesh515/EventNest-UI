export const permissionKeys = {
  all: ['permissions'] as const,
  catalog: () => [...permissionKeys.all, 'catalog'] as const,
  user: (userId: string) => [...permissionKeys.all, 'user', userId] as const,
}

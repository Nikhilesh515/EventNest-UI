import { useAuth } from '@/features/auth/AuthContext'

export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

import { useCallback } from 'react'

import { useAuth } from './AuthContext'

export function useLogout() {
  const { logout } = useAuth()
  return useCallback(async () => {
    await logout()
  }, [logout])
}

import { useCallback } from 'react'
import { useAuth } from './AuthContext'

export function useLogin() {
  const { login } = useAuth()
  return useCallback(
    async (email: string, password: string) => {
      await login(email, password)
    },
    [login],
  )
}

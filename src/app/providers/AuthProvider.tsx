import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '@/features/auth/AuthContext'
import type { AuthContextValue } from '@/features/auth/AuthContext'
import * as authApi from '@/features/auth/api'
import { getUserPermissions } from '@/features/permissions/api'
import { ROLE_DEFAULTS } from '@/lib/permissions'
import { getAccessToken, setAccessToken, clearSession } from '@/lib/storage'
import { isAppApiError } from '@/api/errors'
import type { RegisterInput, UserDto } from '@/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<UserDto | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [status, setStatus] = useState<AuthContextValue['status']>('idle')

  const loadPermissions = useCallback(async (target: UserDto): Promise<string[]> => {
    try {
      const effective = await getUserPermissions(target.id)
      return effective.map((permission) => permission.name)
    } catch {
      return ROLE_DEFAULTS[target.role] ?? []
    }
  }, [])

  const bootstrap = useCallback(async () => {
    const existing = getAccessToken()
    if (!existing) {
      try {
        await authApi.refresh()
      } catch {
        setUser(null)
        setPermissions([])
        setStatus('anonymous')
        return
      }
    }
    setStatus('loading')
    try {
      const me = await authApi.getCurrentUser()
      const effective = await loadPermissions(me)
      setUser(me)
      setPermissions(effective)
      setStatus('authenticated')
    } catch (error) {
      if (isAppApiError(error) && error.status === 401) clearSession()
      setUser(null)
      setPermissions([])
      setStatus('anonymous')
    }
  }, [loadPermissions])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password })
      setAccessToken('cookie-session')
      const effective = await loadPermissions(response.user)
      setUser(response.user)
      setPermissions(effective)
      setStatus('authenticated')
      queryClient.setQueryData(['users', 'me'], response.user)
      return response.user
    },
    [loadPermissions, queryClient],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await authApi.register({
        displayName: input.displayName,
        email: input.email,
        password: input.password,
      })
      setAccessToken('cookie-session')
      const effective = await loadPermissions(response.user)
      setUser(response.user)
      setPermissions(effective)
      setStatus('authenticated')
      queryClient.setQueryData(['users', 'me'], response.user)
      return response.user
    },
    [loadPermissions, queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // A failed logout must never trap the user in the session.
    }
    clearSession()
    setUser(null)
    setPermissions([])
    setStatus('anonymous')
    queryClient.clear()
  }, [queryClient])

  const refresh = useCallback(async () => {
    if (!user) return
    const effective = await loadPermissions(user)
    setPermissions(effective)
  }, [user, loadPermissions])

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  )

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      status,
      login,
      register,
      logout,
      refresh,
      bootstrap,
      hasPermission,
    }),
    [user, permissions, status, login, register, logout, refresh, bootstrap, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

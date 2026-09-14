import { createContext, useContext } from 'react'
import type { RegisterInput, UserDto } from '@/types'

export interface AuthContextValue {
  user: UserDto | null
  permissions: string[]
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous'
  login: (email: string, password: string) => Promise<UserDto>
  register: (input: RegisterInput) => Promise<UserDto>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  bootstrap: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

export const ANONYMOUS_AUTH: AuthContextValue = {
  user: null,
  permissions: [],
  status: 'anonymous',
  login: async () => Promise.reject(new Error('AuthProvider is not mounted.')),
  register: async () => Promise.reject(new Error('AuthProvider is not mounted.')),
  logout: async () => undefined,
  refresh: async () => undefined,
  bootstrap: async () => undefined,
  hasPermission: () => false,
}

export const AuthContext = createContext<AuthContextValue>(ANONYMOUS_AUTH)

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

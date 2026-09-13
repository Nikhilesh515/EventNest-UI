import { createContext, useContext } from 'react'
import type { RegisterInput, UserDto } from '@/types'

export interface AuthContextValue {
  user: UserDto | null
  permissions: string[]
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous'
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  bootstrap: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

export const ANONYMOUS_AUTH: AuthContextValue = {
  user: null,
  permissions: [],
  status: 'anonymous',
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  refresh: async () => undefined,
  bootstrap: async () => undefined,
  hasPermission: () => false,
}

export const AuthContext = createContext<AuthContextValue>(ANONYMOUS_AUTH)

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

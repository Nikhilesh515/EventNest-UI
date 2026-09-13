import { useCallback } from 'react'

import type { RegisterInput } from '@/types'

import { useAuth } from './AuthContext'

export function useRegister() {
  const { register } = useAuth()
  return useCallback(
    async (input: RegisterInput) => {
      await register(input)
    },
    [register],
  )
}

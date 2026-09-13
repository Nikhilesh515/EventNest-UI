import { useEffect } from 'react'
import { useAuth } from './AuthContext'

export function useBootstrapSession(): void {
  const { bootstrap } = useAuth()
  useEffect(() => {
    void bootstrap()
  }, [bootstrap])
}

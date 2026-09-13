import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { applyTheme, readStoredTheme, systemPrefersDark } from '@/app/boot/theme-flash'
import type { Theme } from '@/app/boot/theme-flash'
import { ThemeContext } from '@/app/providers/ThemeContext'
import type { ThemeContextValue } from '@/app/providers/ThemeContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { STORAGE_KEYS, writeStorage } from '@/lib/storage'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = readStoredTheme()
    return stored ?? (systemPrefersDark() ? 'dark' : 'light')
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    writeStorage(STORAGE_KEYS.theme, next)
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    writeStorage(STORAGE_KEYS.theme, next)
    if (!reducedMotion) {
      document.documentElement.classList.add('theme-switching')
      window.setTimeout(() => document.documentElement.classList.remove('theme-switching'), 340)
    }
    setThemeState(next)
  }, [theme, reducedMotion])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

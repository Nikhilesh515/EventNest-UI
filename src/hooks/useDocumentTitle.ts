import { useEffect } from 'react'
import { env } from '@/lib/env'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title.includes(env.appName) ? title : `${title} · ${env.appName}`
  }, [title])
}

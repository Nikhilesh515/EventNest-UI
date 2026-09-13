import { useEffect } from 'react'

export function useLiveAnnouncer(message: string): void {
  useEffect(() => {
    const region = document.getElementById('route-live')
    if (region) region.textContent = message
  }, [message])
}

export function safeReturnUrl(raw: string | null): string {
  if (!raw) return '/events'
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return '/events'
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/events'
  return decoded
}

export function currentEventId(pathname: string): string | null {
  const match = pathname.match(/^\/events\/([^/]+)(?:\/(?:attendees|edit))?$/)
  if (!match) return null
  if (match[1] === 'create' || match[1] === 'new') return null
  return match[1] ?? null
}

export function activeAlbumPage(pathname: string): string {
  if (/^\/events\/create$/.test(pathname) || /^\/events\/[^/]+\/edit$/.test(pathname)) return '04'
  if (/^\/events\/[^/]+\/attendees$/.test(pathname)) return '05'
  if (/^\/events/.test(pathname)) return '01'
  if (pathname === '/my-events') return '02'
  if (pathname === '/my-rsvps') return '03'
  if (pathname.startsWith('/admin/users')) return '06'
  if (pathname.startsWith('/admin/tags')) return '07'
  if (pathname === '/styleguide') return '08'
  if (pathname === '/login') return '09'
  if (pathname === '/register') return '10'
  return '01'
}

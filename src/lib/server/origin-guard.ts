function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function getApiOriginGuardResponse(request: Request): Response | null {
  const pathname = new URL(request.url).pathname
  if (!pathname.startsWith('/api/')) return null

  const prodUrl = process.env.PULSE_PROD_URL?.trim()
  if (!prodUrl || process.env.NODE_ENV === 'development') return null

  const origin = request.headers.get('origin') ?? request.headers.get('referer')
  const allowedOrigin = toOrigin(prodUrl)
  const requestOrigin = origin ? toOrigin(origin) : null
  const allowed = Boolean(allowedOrigin && requestOrigin === allowedOrigin)

  if (!allowed) {
    return new Response('Forbidden', { status: 403 })
  }

  return null
}

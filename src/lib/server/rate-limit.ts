const buckets = new Map<string, { count: number; resetAt: number }>()

function getClientAddress(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

export function assertRateLimit(
  request: Request,
  namespace: string,
  limit = 60,
  windowMs = 60_000,
): Response | null {
  const client = getClientAddress(request)
  const key = `${namespace}:${client}`
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (bucket.count >= limit) {
    return Response.json(
      { error: 'Rate limit exceeded.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))),
        },
      },
    )
  }

  bucket.count += 1
  return null
}

export function resetRateLimitBuckets() {
  buckets.clear()
}

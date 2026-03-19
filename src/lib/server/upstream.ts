const DEFAULT_CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=900'
const MAX_CACHE_SIZE = 500
const upstreamJsonCache = new Map<
  string,
  { expiresAt: number; data: unknown }
>()

function evictCacheIfNeeded() {
  if (upstreamJsonCache.size < MAX_CACHE_SIZE) return
  const now = Date.now()
  for (const [key, entry] of upstreamJsonCache) {
    if (entry.expiresAt <= now) upstreamJsonCache.delete(key)
  }
  if (upstreamJsonCache.size < MAX_CACHE_SIZE) return
  let oldestKey: string | null = null
  let oldestExpires = Infinity
  for (const [key, entry] of upstreamJsonCache) {
    if (entry.expiresAt < oldestExpires) {
      oldestExpires = entry.expiresAt
      oldestKey = key
    }
  }
  if (oldestKey) upstreamJsonCache.delete(oldestKey)
}

type UpstreamRequestInit = RequestInit & {
  cacheControl?: string
  cacheTtlMs?: number
  /** Optional cache key for POST requests; when set, enables caching for non-GET */
  cacheKey?: string
}

function buildErrorResponse(message: string, status = 502) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status
  }

  return 502
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Upstream request failed.'
}

export async function readUpstreamJson(
  url: string,
  init?: UpstreamRequestInit,
) {
  const {
    headers,
    cacheTtlMs,
    cacheKey: explicitCacheKey,
    ...requestInit
  } = init ?? {}
  const method = requestInit.method?.toUpperCase() ?? 'GET'
  const cacheKey = explicitCacheKey ?? (method === 'GET' ? url : null)

  if (cacheKey && cacheTtlMs) {
    const cached = upstreamJsonCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
  }

  let upstream: Response
  try {
    upstream = await fetch(url, {
      ...requestInit,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    })
  } catch {
    throw Object.assign(new Error('Upstream request failed.'), { status: 502 })
  }

  const body = await upstream.text()
  let json: unknown

  try {
    json = JSON.parse(body)
  } catch {
    throw Object.assign(new Error('Upstream returned invalid JSON.'), {
      status: 502,
    })
  }

  if (!upstream.ok) {
    const message =
      typeof json === 'object' &&
      json !== null &&
      'error' in json &&
      typeof json.error === 'string'
        ? json.error
        : upstream.status === 429
          ? 'Upstream rate limit exceeded.'
          : 'Upstream request failed.'

    throw Object.assign(new Error(message), { status: upstream.status })
  }

  if (cacheKey && cacheTtlMs) {
    evictCacheIfNeeded()
    upstreamJsonCache.set(cacheKey, {
      data: json,
      expiresAt: Date.now() + cacheTtlMs,
    })
  }

  return json
}

export async function fetchUpstreamJson(
  url: string,
  init?: UpstreamRequestInit,
) {
  const {
    cacheControl = DEFAULT_CACHE_CONTROL,
    headers,
    ...requestInit
  } = init ?? {}
  try {
    const json = await readUpstreamJson(url, { ...requestInit, headers })
    return Response.json(json, {
      headers: {
        'Cache-Control': cacheControl,
      },
    })
  } catch (error) {
    return buildErrorResponse(getErrorMessage(error), getErrorStatus(error))
  }
}

export function upstreamErrorResponse(error: unknown) {
  return buildErrorResponse(getErrorMessage(error), getErrorStatus(error))
}

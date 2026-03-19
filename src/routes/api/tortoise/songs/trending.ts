import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

function parseBoundedInt(
  value: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (value == null) return fallback
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export const Route = createFileRoute('/api/tortoise/songs/trending')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = new URLSearchParams()
        const timeframe = url.searchParams.get('timeframe') ?? '30d'
        params.set('timeframe', timeframe)
        params.set(
          'page',
          String(parseBoundedInt(url.searchParams.get('page'), 1, 1000, 1)),
        )
        params.set(
          'limit',
          String(parseBoundedInt(url.searchParams.get('limit'), 1, 100, 20)),
        )
        return fetchUpstreamJson(
          `https://tortoise.studio/api/songs/trending?${params.toString()}`,
          {
            cacheTtlMs: 3_600_000,
            cacheControl: 'public, max-age=3600, stale-while-revalidate=21600',
          },
        )
      },
    },
  },
})

import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

const HISTORY_ALLOWLIST = ['market', 'interval', 'fidelity'] as const

export const Route = createFileRoute('/api/polymarket/history')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = new URLSearchParams()
        for (const key of HISTORY_ALLOWLIST) {
          const val = url.searchParams.get(key)
          if (val != null) params.set(key, val)
        }
        return fetchUpstreamJson(
          `https://clob.polymarket.com/prices-history?${params.toString()}`,
          {
            cacheTtlMs: 60_000,
            cacheControl: 'public, max-age=60',
          },
        )
      },
    },
  },
})

import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

const POLYMARKET_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/
const EVENTS_ALLOWLIST = [
  'active',
  'closed',
  'order',
  'ascending',
  'limit',
  'offset',
] as const

export const Route = createFileRoute('/api/polymarket/events')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const singleId = url.searchParams.get('singleId')

        let upstreamUrl: string
        if (singleId) {
          if (!POLYMARKET_ID_REGEX.test(singleId)) {
            return Response.json(
              { error: 'Invalid event ID format.' },
              { status: 400, headers: { 'Cache-Control': 'no-store' } },
            )
          }
          upstreamUrl = `https://gamma-api.polymarket.com/events/${singleId}`
        } else {
          const params = new URLSearchParams()
          for (const key of EVENTS_ALLOWLIST) {
            const val = url.searchParams.get(key)
            if (val != null) params.set(key, val)
          }
          upstreamUrl = `https://gamma-api.polymarket.com/events?${params.toString()}`
        }

        return fetchUpstreamJson(upstreamUrl, {
          cacheTtlMs: 15_000,
          cacheControl: 'public, max-age=15',
        })
      },
    },
  },
})

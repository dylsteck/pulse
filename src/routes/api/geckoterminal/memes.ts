import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

const GECKO_HEADERS = {
  Accept: 'application/json;version=20230203',
}

export const Route = createFileRoute('/api/geckoterminal/memes')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const rawPage = url.searchParams.get('page') ?? '1'
        const parsed = Math.max(1, Math.min(100, Math.floor(Number(rawPage)) || 1))
        const page = String(parsed)
        const params = new URLSearchParams({
          sort: 'h24_volume_usd_desc',
          include: 'base_token',
          page,
        })

        return fetchUpstreamJson(
          `https://api.geckoterminal.com/api/v2/networks/solana/dexes/pump-fun/pools?${params.toString()}`,
          {
            headers: GECKO_HEADERS,
            cacheTtlMs: 60_000,
            cacheControl: 'public, max-age=60, stale-while-revalidate=300',
          },
        )
      },
    },
  },
})

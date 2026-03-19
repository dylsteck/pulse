import { createFileRoute } from '@tanstack/react-router'
import { readUpstreamJson, upstreamErrorResponse } from '@/lib/server/upstream'

const GECKO_HEADERS = {
  Accept: 'application/json;version=20230203',
}

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export const Route = createFileRoute('/api/geckoterminal/token-detail')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const address = url.searchParams.get('address')

        if (!address) {
          return Response.json(
            { error: 'Missing token address.' },
            {
              status: 400,
              headers: { 'Cache-Control': 'no-store' },
            },
          )
        }

        if (!SOLANA_ADDRESS_REGEX.test(address)) {
          return Response.json(
            { error: 'Invalid token address format.' },
            {
              status: 400,
              headers: { 'Cache-Control': 'no-store' },
            },
          )
        }

        try {
          const [token, info] = await Promise.all([
            readUpstreamJson(
              `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${encodeURIComponent(address)}`,
              { headers: GECKO_HEADERS, cacheTtlMs: 60_000 },
            ),
            readUpstreamJson(
              `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${encodeURIComponent(address)}/info`,
              { headers: GECKO_HEADERS, cacheTtlMs: 60_000 },
            ),
          ])

          return Response.json(
            { token, info },
            {
              headers: {
                'Cache-Control':
                  'public, max-age=60, stale-while-revalidate=300',
              },
            },
          )
        } catch (error) {
          return upstreamErrorResponse(error)
        }
      },
    },
  },
})

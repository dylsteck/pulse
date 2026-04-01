import { createFileRoute } from '@tanstack/react-router'
import {
  buildBarsQuery,
  parseCodexBarsParams,
} from '@/lib/codex'
import { assertRateLimit } from '@/lib/server/rate-limit'
import { fetchUpstreamJson } from '@/lib/server/upstream'

const CODEX_GRAPHQL_URL = 'https://graph.codex.io/graphql'

function getCodexApiKey() {
  return process.env.CODEX_API_KEY?.trim()
}

export const Route = createFileRoute('/api/codex/bars')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = getCodexApiKey()
        if (!apiKey) {
          return Response.json(
            { error: 'Service temporarily unavailable.' },
            { status: 503, headers: { 'Cache-Control': 'no-store' } },
          )
        }

        const url = new URL(request.url)
        const params = parseCodexBarsParams(url.searchParams)
        if (!params) {
          return Response.json(
            { error: 'Invalid Codex bars parameters.' },
            { status: 400, headers: { 'Cache-Control': 'no-store' } },
          )
        }

        await assertRateLimit(request, {
          namespace: 'codex:bars',
          limit: 60,
          windowMs: 60_000,
        })

        return fetchUpstreamJson(CODEX_GRAPHQL_URL, {
          method: 'POST',
          body: JSON.stringify(buildBarsQuery(params.address, params.windowLabel)),
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
          },
          cacheKey: `codex:bars:${params.address}:${params.windowLabel}`,
          cacheTtlMs: 30_000,
          cacheControl: 'public, max-age=30',
        })
      },
    },
  },
})

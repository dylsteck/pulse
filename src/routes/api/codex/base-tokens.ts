import { createFileRoute } from '@tanstack/react-router'
import {
  buildBaseTokensQuery,
  parseCodexBaseTokensParams,
} from '@/lib/codex'
import { assertRateLimit } from '@/lib/server/rate-limit'
import { fetchUpstreamJson } from '@/lib/server/upstream'

function getCodexApiKey() {
  const apiKey = process.env.CODEX_API_KEY?.trim()
  if (!apiKey) {
    return Response.json(
      { error: 'Service temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return apiKey
}

export const Route = createFileRoute('/api/codex/base-tokens')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = getCodexApiKey()
        if (apiKey instanceof Response) return apiKey

        await assertRateLimit(request, 'codex:base-tokens', {
          limit: 60,
          windowMs: 60_000,
        })

        const url = new URL(request.url)
        const params = parseCodexBaseTokensParams(url.searchParams)
        if (!params) {
          return Response.json(
            { error: 'Invalid query parameters.' },
            { status: 400, headers: { 'Cache-Control': 'no-store' } },
          )
        }

        const body = JSON.stringify(
          buildBaseTokensQuery(params.limit, params.offset),
        )

        return fetchUpstreamJson('https://graph.codex.io/graphql', {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
          },
          cacheKey: `codex:base-tokens:${params.limit}:${params.offset}`,
          cacheTtlMs: 60_000,
          cacheControl: 'public, max-age=60',
        })
      },
    },
  },
})

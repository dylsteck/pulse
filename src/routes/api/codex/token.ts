import { createHash } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import {
  buildTokenByAddressQuery,
  parseCodexTokenParams,
} from '@/lib/codex'
import { fetchUpstreamJson } from '@/lib/server/upstream'
import { assertRateLimit } from '@/lib/server/rate-limit'

function codexUnavailableResponse() {
  return Response.json(
    { error: 'Service temporarily unavailable.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  )
}

export const Route = createFileRoute('/api/codex/token')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.CODEX_API_KEY?.trim()
        if (!apiKey) {
          return codexUnavailableResponse()
        }

        const url = new URL(request.url)
        const parsed = parseCodexTokenParams(url.searchParams)
        if (!parsed) {
          return Response.json(
            { error: 'Invalid token address.' },
            { status: 400, headers: { 'Cache-Control': 'no-store' } },
          )
        }

        await assertRateLimit(request, 'codex:token')

        const body = JSON.stringify(buildTokenByAddressQuery(parsed.address))
        const cacheKey = createHash('sha256').update(body).digest('hex')

        return fetchUpstreamJson('https://graph.codex.io/graphql', {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
          },
          cacheKey: `codex:token:${cacheKey}`,
          cacheTtlMs: 60_000,
          cacheControl: 'public, max-age=60',
        })
      },
    },
  },
})

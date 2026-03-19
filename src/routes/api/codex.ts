import { createHash } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

export const Route = createFileRoute('/api/codex')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.CODEX_API_KEY
        if (!apiKey?.trim()) {
          return Response.json(
            { error: 'Service temporarily unavailable.' },
            { status: 503, headers: { 'Cache-Control': 'no-store' } },
          )
        }

        const body = await request.text()
        const hash = createHash('sha256').update(body).digest('hex')
        return fetchUpstreamJson('https://graph.codex.io/graphql', {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
          },
          cacheKey: `codex:${hash}`,
          cacheTtlMs: 60_000,
          cacheControl: 'public, max-age=60',
        })
      },
    },
  },
})

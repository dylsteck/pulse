import { createFileRoute } from '@tanstack/react-router'
import { createHash } from 'node:crypto'
import { fetchUpstreamJson } from '@/lib/server/upstream'

export const Route = createFileRoute('/api/zora')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()
        const hash = createHash('sha256').update(body).digest('hex')
        return fetchUpstreamJson('https://api.zora.co/universal/graphql', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          cacheKey: `zora:${hash}`,
          cacheTtlMs: 60_000,
          cacheControl: 'public, max-age=60',
        })
      },
    },
  },
})

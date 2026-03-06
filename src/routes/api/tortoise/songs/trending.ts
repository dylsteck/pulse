import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

export const Route = createFileRoute('/api/tortoise/songs/trending')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { search } = new URL(request.url)
        return fetchUpstreamJson(
          `https://tortoise.studio/api/songs/trending${search}`,
          {
            cacheTtlMs: 3_600_000,
            cacheControl: 'public, max-age=3600, stale-while-revalidate=21600',
          },
        )
      },
    },
  },
})

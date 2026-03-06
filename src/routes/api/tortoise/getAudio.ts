import { createFileRoute } from '@tanstack/react-router'
import { fetchUpstreamJson } from '@/lib/server/upstream'

const SLUG_REGEX = /^[a-zA-Z0-9_-]{1,128}$/

export const Route = createFileRoute('/api/tortoise/getAudio')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const slug = url.searchParams.get('slug')
        if (!slug) {
          return Response.json(
            { error: 'Missing slug.' },
            { status: 400, headers: { 'Cache-Control': 'no-store' } },
          )
        }
        if (!SLUG_REGEX.test(slug)) {
          return Response.json(
            { error: 'Invalid slug format.' },
            { status: 400, headers: { 'Cache-Control': 'no-store' } },
          )
        }
        return fetchUpstreamJson(
          `https://tortoise.studio/api/getAudio?slug=${encodeURIComponent(slug)}`,
          {
            cacheTtlMs: 3_600_000,
            cacheControl: 'public, max-age=3600, stale-while-revalidate=21600',
          },
        )
      },
    },
  },
})

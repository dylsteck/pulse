import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/tortoise/songs/trending')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { search } = new URL(request.url)
        const res = await fetch(
          `https://tortoise.studio/api/songs/trending${search}`,
        )
        return new Response(res.body, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})

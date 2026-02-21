import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/polymarket/events')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const singleId = url.searchParams.get('singleId')

        let upstreamUrl: string
        if (singleId) {
          upstreamUrl = `https://gamma-api.polymarket.com/events/${singleId}`
        } else {
          url.searchParams.delete('singleId')
          upstreamUrl = `https://gamma-api.polymarket.com/events${url.search}`
        }

        const res = await fetch(upstreamUrl)
        return new Response(res.body, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=15',
          },
        })
      },
    },
  },
})

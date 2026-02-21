import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/polymarket/history')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { search } = new URL(request.url)
        const res = await fetch(`https://clob.polymarket.com/prices-history${search}`)
        return new Response(res.body, {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})

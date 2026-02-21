import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/zora')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()
        const res = await fetch('https://api.zora.co/universal/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
        return new Response(res.body, {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})

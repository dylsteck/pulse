import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/codex')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()
        const res = await fetch('https://graph.codex.io/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: process.env.CODEX_API_KEY!,
          },
          body,
        })
        return new Response(res.body, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60',
          },
        })
      },
    },
  },
})

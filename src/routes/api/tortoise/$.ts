import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/tortoise/$')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { search } = new URL(request.url)
        const splat = (params as { _splat?: string })._splat ?? ''
        const res = await fetch(`https://tortoise.studio/api/${splat}${search}`)
        return new Response(res.body, {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})

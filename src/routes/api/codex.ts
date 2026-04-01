import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/codex')({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { error: 'Use a typed /api/codex/* endpoint.' },
          { status: 410, headers: { 'Cache-Control': 'no-store' } },
        ),
      POST: async () =>
        Response.json(
          { error: 'Raw Codex GraphQL proxying is disabled.' },
          { status: 410, headers: { 'Cache-Control': 'no-store' } },
        ),
    },
  },
})

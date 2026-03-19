import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/memes')({
  beforeLoad: () => {
    throw redirect({ to: '/', search: { type: 'memes' } })
  },
  component: () => null,
})

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/perps')({
  beforeLoad: () => {
    throw redirect({ to: '/', search: { type: 'perps' } })
  },
  component: () => null,
})

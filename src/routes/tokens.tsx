import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

export const Route = createFileRoute('/tokens')({
  component: TokensPage,
})

function TokensPage() {
  const navigate = useNavigate()
  return (
    <UnifiedList
      initialMode="tokens"
      onModeChange={(mode) => {
        if (mode === 'markets') navigate({ to: '/markets' })
        if (mode === 'creators') navigate({ to: '/creators' })
        if (mode === 'music') navigate({ to: '/music' })
        if (mode === 'perps') navigate({ to: '/perps' })
      }}
    />
  )
}

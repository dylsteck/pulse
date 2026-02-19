import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

export const Route = createFileRoute('/markets')({
  component: MarketsPage,
})

function MarketsPage() {
  const navigate = useNavigate()
  return (
    <UnifiedList
      initialMode="markets"
      onModeChange={(mode) => {
        if (mode === 'tokens') navigate({ to: '/tokens' })
        if (mode === 'music') navigate({ to: '/music' })
      }}
    />
  )
}

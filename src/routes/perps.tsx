import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

export const Route = createFileRoute('/perps')({
  component: PerpsPage,
})

function PerpsPage() {
  const navigate = useNavigate()
  return (
    <UnifiedList
      initialMode="perps"
      onModeChange={(mode) => {
        if (mode === 'tokens') navigate({ to: '/tokens' })
        if (mode === 'markets') navigate({ to: '/markets' })
        if (mode === 'creators') navigate({ to: '/creators' })
        if (mode === 'music') navigate({ to: '/music' })
      }}
    />
  )
}

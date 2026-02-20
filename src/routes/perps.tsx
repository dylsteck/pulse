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
        if (mode === 'tokens') navigate({ to: '/tokens', resetScroll: false })
        if (mode === 'markets') navigate({ to: '/markets', resetScroll: false })
        if (mode === 'creators')
          navigate({ to: '/creators', resetScroll: false })
        if (mode === 'music') navigate({ to: '/music', resetScroll: false })
      }}
    />
  )
}

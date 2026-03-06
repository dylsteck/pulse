import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

export const Route = createFileRoute('/memes')({
  component: MemesPage,
})

function MemesPage() {
  const navigate = useNavigate()
  return (
    <UnifiedList
      initialMode="memes"
      onModeChange={(mode) => {
        if (mode === 'tokens') navigate({ to: '/tokens', resetScroll: false })
        if (mode === 'markets') navigate({ to: '/markets', resetScroll: false })
        if (mode === 'creators')
          navigate({ to: '/creators', resetScroll: false })
        if (mode === 'music') navigate({ to: '/music', resetScroll: false })
        if (mode === 'perps') navigate({ to: '/perps', resetScroll: false })
      }}
    />
  )
}

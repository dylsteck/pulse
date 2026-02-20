import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

export const Route = createFileRoute('/music')({
  component: MusicPage,
})

function MusicPage() {
  const navigate = useNavigate()
  return (
    <UnifiedList
      initialMode="music"
      onModeChange={(mode) => {
        if (mode === 'tokens') navigate({ to: '/tokens', resetScroll: false })
        if (mode === 'markets') navigate({ to: '/markets', resetScroll: false })
        if (mode === 'creators')
          navigate({ to: '/creators', resetScroll: false })
        if (mode === 'perps') navigate({ to: '/perps', resetScroll: false })
      }}
    />
  )
}

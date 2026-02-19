import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

export const Route = createFileRoute('/creators')({
  component: CreatorsPage,
})

function CreatorsPage() {
  const navigate = useNavigate()
  return (
    <UnifiedList
      initialMode="creators"
      onModeChange={(mode) => {
        if (mode === 'tokens') navigate({ to: '/tokens' })
        if (mode === 'markets') navigate({ to: '/markets' })
        if (mode === 'music') navigate({ to: '/music' })
        if (mode === 'perps') navigate({ to: '/perps' })
      }}
    />
  )
}

import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'

const VALID_TYPES = ['tokens', 'markets', 'perps', 'memes'] as const
type ViewType = (typeof VALID_TYPES)[number]

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { type: ViewType } => {
    const t = search?.type
    return {
      type: VALID_TYPES.includes(t as ViewType) ? (t as ViewType) : 'tokens',
    }
  },
  search: {
    middlewares: [stripSearchParams({ type: 'tokens' })],
  },
  component: IndexPage,
})

function IndexPage() {
  const { type } = Route.useSearch()
  return <UnifiedList initialMode={type} />
}

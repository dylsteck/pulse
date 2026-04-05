import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { UnifiedList } from '@/components/dashboard/unified-list'
import {
  stripHomeSearchDefaults,
  validateHomeSearch,
} from '@/lib/home-search'

export const Route = createFileRoute('/')({
  validateSearch: validateHomeSearch,
  search: {
    middlewares: [
      stripSearchParams({ type: 'trending' }),
      stripHomeSearchDefaults(),
    ],
  },
  component: IndexPage,
})

function IndexPage() {
  return <UnifiedList />
}

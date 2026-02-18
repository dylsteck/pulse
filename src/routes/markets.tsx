import { createFileRoute } from '@tanstack/react-router'
import { MarketsList } from '@/components/markets/markets-list'

export const Route = createFileRoute('/markets')({
  component: MarketsPage,
})

function MarketsPage() {
  return <MarketsList />
}

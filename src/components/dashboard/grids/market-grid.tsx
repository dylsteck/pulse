import React from 'react'
import type { Market } from '@/lib/types'
import type { GridFilters } from '@/lib/grid-filter-types'
import { MarketGridCard } from '@/components/dashboard/cards'
import { CardGrid } from '@/components/dashboard/shared'
import { sortMarketsForGrid } from '@/lib/grid-sorts'

interface MarketGridProps {
  markets: Array<Market>
  filters: GridFilters
}

export function MarketGrid({ markets, filters }: MarketGridProps) {
  const prepared = sortMarketsForGrid(markets, filters.sort)
  return (
    <CardGrid>
      {prepared.map((market) => (
        <MarketGridCard key={market.id} market={market} />
      ))}
    </CardGrid>
  )
}

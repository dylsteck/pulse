import React from 'react'
import type { Market } from '@/lib/types'
import { MarketGridCard } from '@/components/dashboard/cards'
import { CardGrid } from '@/components/dashboard/shared'

interface MarketGridProps {
  markets: Array<Market>
}

export function MarketGrid({ markets }: MarketGridProps) {
  return (
    <CardGrid>
      {markets.map((market) => (
        <MarketGridCard key={market.id} market={market} />
      ))}
    </CardGrid>
  )
}

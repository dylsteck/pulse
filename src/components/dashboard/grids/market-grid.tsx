import React from 'react'
import type { Market } from '@/lib/types'
import { MarketGridCard } from '@/components/dashboard/cards'

interface MarketGridProps {
  markets: Array<Market>
}

export function MarketGrid({ markets }: MarketGridProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {markets.map((market) => (
        <MarketGridCard key={market.id} market={market} />
      ))}
    </div>
  )
}

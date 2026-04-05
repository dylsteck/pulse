import React from 'react'
import type { Token } from '@/lib/types'
import type { GridFilters } from '@/lib/grid-filter-types'
import { TokenGridCard } from '@/components/dashboard/cards'
import { CardGrid } from '@/components/dashboard/shared'
import {
  filterTokensByNetwork,
  sortTokensForGrid,
} from '@/lib/grid-sorts'

interface TokenGridProps {
  tokens: Array<Token>
  filters: GridFilters
}

export function TokenGrid({ tokens, filters }: TokenGridProps) {
  const prepared = sortTokensForGrid(
    filterTokensByNetwork(tokens, filters.networks),
    filters.sort,
  )
  return (
    <CardGrid>
      {prepared.map((token) => (
        <TokenGridCard key={token.id} token={token} />
      ))}
    </CardGrid>
  )
}

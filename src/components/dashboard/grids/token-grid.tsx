import React from 'react'
import type { Token } from '@/lib/types'
import { TokenGridCard } from '@/components/dashboard/cards'
import { CardGrid } from '@/components/dashboard/shared'

interface TokenGridProps {
  tokens: Array<Token>
}

export function TokenGrid({ tokens }: TokenGridProps) {
  return (
    <CardGrid>
      {tokens.map((token) => (
        <TokenGridCard key={token.id} token={token} />
      ))}
    </CardGrid>
  )
}

import React from 'react'
import type { Token } from '@/lib/types'
import { TokenGridCard } from '@/components/dashboard/cards'

interface TokenGridProps {
  tokens: Array<Token>
}

export function TokenGrid({ tokens }: TokenGridProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {tokens.map((token) => (
        <TokenGridCard key={token.id} token={token} />
      ))}
    </div>
  )
}

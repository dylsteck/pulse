import React from 'react'
import { Link } from '@tanstack/react-router'
import type { Token } from '@/lib/types'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export const TokenGridCard = React.memo(function TokenGridCard({
  token,
}: {
  token: Token
}) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'tokens', id: token.id }}
      className="block overflow-hidden rounded-xl border border-border bg-card p-3 text-left hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {token.imageUrl && (
            <FadeImage
              src={token.imageUrl}
              alt=""
              wrapperClassName="size-7 shrink-0 rounded-full"
              className="size-7 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium">{token.symbol}</div>
            <div className="truncate text-xs text-muted-foreground">
              {token.name}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div
          className={cn(
            'text-xs tabular-nums',
            token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {token.change24h >= 0 ? '+' : ''}
          {token.change24h.toFixed(2)}%
        </div>
      </div>
      <div className="mt-3 text-lg tabular-nums">
        ${formatPrice(token.price)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Volume</span>
        <span className="text-right tabular-nums">{formatCompact(token.volume24h)}</span>
        <span className="text-muted-foreground">Mkt Cap</span>
        <span className="text-right tabular-nums">{formatCompact(token.marketCap)}</span>
      </div>
    </Link>
  )
})

import React from 'react'
import { Link } from '@tanstack/react-router'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { formatPerpPrice } from '@/lib/hyperliquid/service'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

function perpIconUrl(coin: string): string {
  return `https://app.hyperliquid.xyz/coins/${coin}.svg`
}

interface PerpGridCardProps {
  market: PerpMarketSnapshot
}

export function PerpGridCard({ market }: PerpGridCardProps) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'perps', id: market.id }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <FadeImage
            src={perpIconUrl(market.coin)}
            alt=""
            wrapperClassName="size-9 shrink-0 rounded-full"
            className="size-9 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-medium">{market.coin}</div>
            <div className="text-xs text-muted-foreground">PERP</div>
          </div>
        </div>
        <div
          className={cn(
            'text-xs tabular-nums',
            market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {market.change24h >= 0 ? '+' : ''}
          {market.change24h.toFixed(2)}%
        </div>
      </div>
      <div className="mt-2 mb-1 text-lg tabular-nums">
        ${formatPerpPrice(market, market.markPx)}
      </div>
      <div className="mt-auto pt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Volume</span>
        <span className="text-right tabular-nums">
          {formatCompact(market.volume24h)}
        </span>
        <span className="text-muted-foreground">Funding</span>
        <span className="text-right tabular-nums">
          {(market.funding * 100).toFixed(4)}%
        </span>
      </div>
    </Link>
  )
}

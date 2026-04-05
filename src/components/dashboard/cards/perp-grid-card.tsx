import React from 'react'
import { Link } from '@tanstack/react-router'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { formatPerpPrice } from '@/lib/hyperliquid/service'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact } from '@/lib/format'
import { buildPerpId } from '@/lib/caip19'
import { ChangeBadge } from '@/components/asset-detail/shared'
import { HyperliquidIcon } from '@/components/icons'

function perpIconUrl(coin: string): string {
  return `https://app.hyperliquid.xyz/coins/${coin}.svg`
}

interface PerpGridCardProps {
  market: PerpMarketSnapshot
}

export function PerpGridCard({ market }: PerpGridCardProps) {
  return (
    <Link
      to="/asset/$identifier"
      params={{ identifier: buildPerpId(market.coin) }}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left hover:bg-accent/40 sm:p-4"
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
        <ChangeBadge value={market.change24h} />
      </div>
      <div className="mt-2 mb-1 text-lg tabular-nums">
        ${formatPerpPrice(market, market.markPx)}
      </div>
      <div className="mt-auto flex items-end justify-between pt-3">
        <span className="text-xs text-muted-foreground">
          {formatCompact(market.volume24h)} Vol
        </span>
        <HyperliquidIcon className="size-4 shrink-0" />
      </div>
    </Link>
  )
}

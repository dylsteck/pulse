import React from 'react'
import { Link } from '@tanstack/react-router'
import type { CreatorToken } from '@/lib/zora/service'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import { buildCreatorId } from '@/lib/caip19'

export const CreatorGridCard = React.memo(function CreatorGridCard({
  creator,
}: {
  creator: CreatorToken
}) {
  return (
    <Link
      to="/asset/$identifier"
      params={{ identifier: buildCreatorId(creator.address) }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {creator.imageUrl && (
            <FadeImage
              src={creator.imageUrl}
              alt=""
              wrapperClassName="size-9 shrink-0 rounded-full"
              className="size-9 rounded-full object-cover"
            />
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="truncate text-sm font-semibold">
              {creator.symbol}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {creator.creatorHandle ?? creator.name}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'text-xs font-medium tabular-nums',
            creator.marketCapDelta24h >= 0
              ? 'text-[#22c55e]'
              : 'text-[#ef4444]',
          )}
        >
          {creator.marketCapDelta24h >= 0 ? '+' : ''}
          {creator.marketCapDelta24h.toFixed(2)}%
        </div>
      </div>
      <div className="mt-auto pt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Mkt Cap</span>
        <span className="text-right tabular-nums">
          {formatCompact(creator.marketCap)}
        </span>
        <span className="text-muted-foreground">24h Vol</span>
        <span className="text-right tabular-nums">
          {formatCompact(creator.volume24h)}
        </span>
        <span className="text-muted-foreground">Holders</span>
        <span className="text-right tabular-nums">
          {creator.uniqueHolders.toLocaleString('en-US')}
        </span>
      </div>
    </Link>
  )
})

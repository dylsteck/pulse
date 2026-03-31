import React from 'react'
import { Link } from '@tanstack/react-router'
import type { MemeToken } from '@/lib/geckoterminal'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export const MemeGridCard = React.memo(function MemeGridCard({
  meme,
}: {
  meme: MemeToken
}) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'memes', id: meme.id }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {meme.imageUrl && (
            <FadeImage
              src={meme.imageUrl}
              alt=""
              wrapperClassName="size-9 shrink-0 rounded-full"
              className="size-9 rounded-full object-cover"
            />
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="truncate text-sm font-medium">{meme.symbol}</div>
            <div className="truncate text-xs text-muted-foreground">
              {meme.name}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'text-xs tabular-nums',
            meme.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {meme.change24h >= 0 ? '+' : ''}
          {meme.change24h.toFixed(2)}%
        </div>
      </div>

      <div className="mt-3 text-lg tabular-nums">
        ${formatPrice(meme.price)}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-3 text-xs">
        <span className="text-muted-foreground">24h Vol</span>
        <span className="text-right tabular-nums">{formatCompact(meme.volume24h)}</span>
        <span className="text-muted-foreground">Liquidity</span>
        <span className="text-right tabular-nums">{formatCompact(meme.liquidity)}</span>
      </div>
    </Link>
  )
})

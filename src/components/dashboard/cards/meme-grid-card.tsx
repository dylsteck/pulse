import React from 'react'
import { Link } from '@tanstack/react-router'
import type { MemeToken } from '@/lib/geckoterminal'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact, formatPrice } from '@/lib/format'
import { buildMemeId } from '@/lib/caip19'
import { ChangeBadge } from '@/components/asset-detail/shared'
import { SolanaIcon } from '@/components/icons'

export const MemeGridCard = React.memo(function MemeGridCard({
  meme,
}: {
  meme: MemeToken
}) {
  return (
    <Link
      to="/asset/$identifier"
      params={{ identifier: buildMemeId(meme.id) }}
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
        <ChangeBadge value={meme.change24h} />
      </div>

      <div className="mt-3 text-lg tabular-nums">
        ${formatPrice(meme.price)}
      </div>
      <div className="mt-auto flex items-end justify-between pt-3">
        <span className="text-xs text-muted-foreground">
          {formatCompact(meme.volume24h)} Vol
        </span>
        <SolanaIcon className="size-4 shrink-0" />
      </div>
    </Link>
  )
})

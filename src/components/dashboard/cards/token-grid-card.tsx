import React from 'react'
import { Link } from '@tanstack/react-router'
import type { Token } from '@/lib/types'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact, formatPrice } from '@/lib/format'
import { buildTokenId } from '@/lib/caip19'
import { ChangeBadge } from '@/components/asset-detail/shared'
import { ChainIcon } from '@/components/icons'


export const TokenGridCard = React.memo(function TokenGridCard({
  token,
}: {
  token: Token
}) {
  return (
    <Link
      to="/asset/$identifier"
      params={{ identifier: buildTokenId(token.id) }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left hover:bg-accent/40 sm:p-4"
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
        <ChangeBadge value={token.change24h} />
      </div>
      <div className="mt-3 text-lg tabular-nums">
        ${formatPrice(token.price)}
      </div>
      <div className="mt-auto flex items-end justify-between pt-3">
        <span className="text-xs text-muted-foreground">
          {formatCompact(token.volume24h)} Vol
        </span>
        {token.networkId !== undefined && (
          <ChainIcon chainId={token.networkId} className="size-4 shrink-0" />
        )}
      </div>
    </Link>
  )
})

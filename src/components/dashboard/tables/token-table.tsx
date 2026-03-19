import React from 'react'
import type { Token } from '@/lib/types'
import { InlineTokenChart } from '@/components/dashboard/inline-charts'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact, formatPrice } from '@/lib/format'

interface TokenTableProps {
  tokens: Array<Token>
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  onRowClick: (index: number) => void
}

export function TokenTable({
  tokens,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: TokenTableProps) {
  const gridCols = 'grid-cols-[2fr_1fr_0.7fr_0.8fr_0.8fr]'
  return (
    <div className="w-full border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'grid gap-2 border-b border-border bg-muted/50 px-3 py-2 sm:gap-4 sm:px-6',
          gridCols,
        )}
      >
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Token
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Price
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h %
        </span>
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Volume
        </span>
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mkt Cap
        </span>
      </div>

      <div className="overflow-hidden">
        {tokens.map((token, i) => {
          const selected = i === selectedIndex
          const expanded = expandedId === token.id
          return (
            <div
              key={token.id}
              className="border-b border-border last:border-0"
            >
              <button
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                type="button"
                onClick={() => onRowClick(i)}
                className={cn(
                  'grid w-full items-center gap-2 border-l-2 px-3 py-2 text-left transition-colors sm:gap-4 sm:px-6',
                  gridCols,
                  selected
                    ? 'border-l-foreground bg-accent'
                    : 'border-l-transparent hover:bg-accent/40',
                )}
                aria-selected={selected}
                aria-expanded={expanded}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {token.imageUrl && (
                    <FadeImage
                      src={token.imageUrl}
                      alt=""
                      wrapperClassName="size-7 shrink-0 rounded-full"
                      className="size-7 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {token.symbol}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {token.name}
                    </div>
                  </div>
                </div>
                <span className="text-right text-sm tabular-nums">
                  ${formatPrice(token.price)}
                </span>
                <span
                  className={cn(
                    'text-right text-sm tabular-nums',
                    token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                  )}
                >
                  {token.change24h >= 0 ? '+' : ''}
                  {token.change24h.toFixed(2)}%
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompact(token.volume24h)}
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompact(token.marketCap)}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                  <InlineTokenChart token={token} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

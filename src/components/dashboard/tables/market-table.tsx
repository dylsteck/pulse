import React from 'react'
import type { Market } from '@/lib/types'
import { InlineMarketChart } from '@/components/dashboard/inline-charts'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact, formatDate } from '@/lib/format'

interface MarketTableProps {
  markets: Array<Market>
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  onRowClick: (index: number) => void
}

export function MarketTable({
  markets,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: MarketTableProps) {
  const gridCols = 'grid-cols-[3fr_0.6fr_0.8fr_0.8fr]'
  return (
    <div className="w-full border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-[4.5rem] z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Market
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Yes
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Volume
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Expires
        </span>
      </div>

      <div className="overflow-hidden">
        {markets.map((market, i) => {
          const selected = i === selectedIndex
          const expanded = expandedId === market.id
          return (
            <div
              key={market.id}
              className="border-b border-border last:border-0"
            >
              <button
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                type="button"
                onClick={() => onRowClick(i)}
                className={cn(
                  'grid w-full items-center gap-4 border-l-2 px-3 py-2 text-left transition-colors sm:px-6',
                  gridCols,
                  selected
                    ? 'border-l-foreground bg-accent'
                    : 'border-l-transparent hover:bg-accent/40',
                )}
                aria-selected={selected}
                aria-expanded={expanded}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {market.imageUrl && (
                    <FadeImage
                      src={market.imageUrl}
                      alt=""
                      wrapperClassName="size-7 shrink-0 rounded-sm"
                      className="size-7 rounded-sm object-cover"
                    />
                  )}
                  <span className="truncate text-sm">{market.title}</span>
                </div>
                <span className="text-right text-sm tabular-nums">
                  {market.yesPercent}%
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompact(market.volume)}
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatDate(market.expiry)}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                  <InlineMarketChart market={market} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

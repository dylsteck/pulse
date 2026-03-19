import React from 'react'
import type { MemeToken } from '@/lib/geckoterminal'
import { InlineMemeChart } from '@/components/dashboard/inline-charts'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact, formatPrice } from '@/lib/format'

interface MemeTableProps {
  memes: Array<MemeToken>
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  onRowClick: (index: number) => void
}

export function MemeTable({
  memes,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: MemeTableProps) {
  const gridCols = 'grid-cols-[2fr_1fr_0.7fr_0.8fr_0.8fr]'

  if (memes.length === 0) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        No meme tokens found
      </div>
    )
  }

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
          Liquidity
        </span>
      </div>

      <div className="overflow-hidden">
        {memes.map((meme, i) => {
          const selected = i === selectedIndex
          const expanded = expandedId === meme.id
          return (
            <div key={meme.id} className="border-b border-border last:border-0">
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
                  {meme.imageUrl && (
                    <FadeImage
                      src={meme.imageUrl}
                      alt=""
                      wrapperClassName="size-7 shrink-0 rounded-full"
                      className="size-7 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {meme.symbol}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {meme.name}
                    </div>
                  </div>
                </div>
                <span className="text-right text-sm tabular-nums">
                  ${formatPrice(meme.price)}
                </span>
                <span
                  className={cn(
                    'text-right text-sm tabular-nums',
                    meme.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                  )}
                >
                  {meme.change24h >= 0 ? '+' : ''}
                  {meme.change24h.toFixed(2)}%
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompact(meme.volume24h)}
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompact(meme.liquidity)}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                  <InlineMemeChart meme={meme} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

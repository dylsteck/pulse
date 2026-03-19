import React from 'react'
import type { CreatorToken } from '@/lib/zora/service'
import { InlineCreatorChart } from '@/components/dashboard/inline-charts'
import { LoadingPanel } from '@/components/dashboard/shared'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'

interface CreatorsTableProps {
  creators: Array<CreatorToken>
  isLoading: boolean
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  onRowClick: (index: number) => void
}

export function CreatorsTable({
  creators,
  isLoading,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: CreatorsTableProps) {
  const gridCols = 'grid-cols-[1.7fr_0.8fr_0.8fr_0.8fr_0.7fr]'

  if (isLoading) {
    return <LoadingPanel label="Loading creators..." />
  }

  if (creators.length === 0) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        No tokens found
      </div>
    )
  }

  return (
    <div className="w-full border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Token
        </span>
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mkt Cap
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h %
        </span>
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h Vol
        </span>
        <span className="sticky top-18 z-10 -mb-px border-b border-border bg-muted/50 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Holders
        </span>
      </div>

      <div className="overflow-hidden">
        {creators.map((creator, i) => {
          const selected = i === selectedIndex
          const expanded = expandedId === creator.id
          return (
            <div
              key={creator.id}
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
                  {creator.imageUrl && (
                    <FadeImage
                      src={creator.imageUrl}
                      alt=""
                      wrapperClassName="size-7 shrink-0 rounded-sm"
                      className="size-7 rounded-sm object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {creator.symbol}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {creator.creatorHandle ?? creator.name}
                    </div>
                  </div>
                </div>
                <span className="text-right text-sm tabular-nums">
                  {formatCompact(creator.marketCap)}
                </span>
                <span
                  className={cn(
                    'text-right text-sm tabular-nums',
                    creator.marketCapDelta24h >= 0
                      ? 'text-[#22c55e]'
                      : 'text-[#ef4444]',
                  )}
                >
                  {creator.marketCapDelta24h >= 0 ? '+' : ''}
                  {creator.marketCapDelta24h.toFixed(2)}%
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompact(creator.volume24h)}
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {creator.uniqueHolders.toLocaleString('en-US')}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                  <InlineCreatorChart creator={creator} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

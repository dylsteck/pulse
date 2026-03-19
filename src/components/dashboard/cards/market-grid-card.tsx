import React from 'react'
import { Link } from '@tanstack/react-router'
import type { Market } from '@/lib/types'
import { ChanceGauge } from '@/components/dashboard/shared'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact } from '@/lib/format'

export const MarketGridCard = React.memo(function MarketGridCard({
  market,
}: {
  market: Market
}) {
  const hasOutcomes = market.outcomes && market.outcomes.length > 0

  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'markets', id: market.id }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {market.imageUrl && (
            <FadeImage
              src={market.imageUrl}
              alt=""
              wrapperClassName="size-9 shrink-0 rounded-lg"
              className="size-9 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="line-clamp-2 text-sm font-medium leading-snug">
              {market.title}
            </div>
          </div>
        </div>

        {!hasOutcomes && <ChanceGauge percent={market.yesPercent} />}
      </div>

      {hasOutcomes ? (
        <div className="mt-3 space-y-1.5">
          {market.outcomes!.map((o) => (
            <div key={o.name} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">{o.name}</span>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                {Math.round(o.percent)}%
              </span>
              <span className="group/yes shrink-0 cursor-pointer rounded px-2 py-0.5 text-xs font-semibold bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e] hover:text-white dark:bg-[#22c55e]/20 dark:hover:bg-[#22c55e] transition-colors">
                <span className="group-hover/yes:hidden">Yes</span>
                <span className="hidden group-hover/yes:inline tabular-nums">
                  {Math.round(o.percent)}%
                </span>
              </span>
              <span className="group/no shrink-0 cursor-pointer rounded px-2 py-0.5 text-xs font-semibold bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444] hover:text-white dark:bg-[#ef4444]/20 dark:hover:bg-[#ef4444] transition-colors">
                <span className="group-hover/no:hidden">No</span>
                <span className="hidden group-hover/no:inline tabular-nums">
                  {Math.round(100 - o.percent)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <div className="group/yes flex-1 cursor-pointer rounded-lg bg-[#22c55e]/15 py-2 text-center text-sm font-semibold text-[#22c55e] hover:bg-[#22c55e] hover:text-white dark:bg-[#22c55e]/20 dark:hover:bg-[#22c55e] transition-colors">
            <span className="group-hover/yes:hidden">Yes</span>
            <span className="hidden group-hover/yes:inline tabular-nums">
              {Math.round(market.yesPercent)}%
            </span>
          </div>
          <div className="group/no flex-1 cursor-pointer rounded-lg bg-[#ef4444]/15 py-2 text-center text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444] hover:text-white dark:bg-[#ef4444]/20 dark:hover:bg-[#ef4444] transition-colors">
            <span className="group-hover/no:hidden">No</span>
            <span className="hidden group-hover/no:inline tabular-nums">
              {Math.round(market.noPercent)}%
            </span>
          </div>
        </div>
      )}

      <div className="mt-auto pt-3 text-xs font-medium text-muted-foreground">
        <span>{formatCompact(market.volume)} Vol.</span>
      </div>
    </Link>
  )
})

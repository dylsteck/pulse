import type { Market } from '@/lib/types'
import { FadeImage } from '@/components/ui/fade-image'
import { formatCompact } from '@/lib/format'

export function MarketCard({ market }: { market: Market }) {
  const hasOutcomes = market.outcomes && market.outcomes.length > 0

  return (
    <div className="flex h-full min-h-0 cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30 sm:p-6">
      <div className="flex items-start gap-4">
        {market.imageUrl && (
          <FadeImage
            src={market.imageUrl}
            alt=""
            wrapperClassName="size-12 shrink-0 rounded-lg sm:size-14"
            className="size-12 rounded-lg object-cover sm:size-14"
          />
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="line-clamp-2 text-base font-medium leading-snug text-foreground sm:text-lg">
            {market.title}
          </div>
        </div>
      </div>

      {hasOutcomes ? (
        <div className="space-y-2">
          {market.outcomes!.slice(0, 3).map((o) => (
            <div key={o.name} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {o.name}
              </span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                {Math.round(o.percent)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg bg-[#22c55e]/15 py-2.5 text-center text-sm font-semibold text-[#22c55e] dark:bg-[#22c55e]/20">
            Yes {Math.round(market.yesPercent)}%
          </div>
          <div className="flex-1 rounded-lg bg-[#ef4444]/15 py-2.5 text-center text-sm font-semibold text-[#ef4444] dark:bg-[#ef4444]/20">
            No {Math.round(market.noPercent)}%
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {formatCompact(market.volume)} Vol.
      </div>
    </div>
  )
}

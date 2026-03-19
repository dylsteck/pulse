import { useMemo } from 'react'
import { Liveline } from 'liveline'
import { FadeImage } from '@/components/ui/fade-image'
import { useDocumentHidden } from '@/hooks/use-document-hidden'
import { formatCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import { HERO_CHART_PADDING } from './types'
import type { CarouselMemeItem } from './types'

export function MemeCard({
  meme,
  isDark,
}: {
  meme: CarouselMemeItem
  isDark: boolean
}) {
  const isPositive = meme.change >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'
  const isTabHidden = useDocumentHidden()

  const chartData = useMemo(() => {
    if (meme.data.length >= 2) return meme.data
    const now = Date.now() / 1000
    const val = meme.data[0]?.value ?? meme.price
    return [
      { time: now - 3600, value: val },
      { time: now, value: meme.price },
    ]
  }, [meme.data, meme.price])

  return (
    <div className="flex h-full min-h-0 cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30 sm:p-6">
      <div className="flex shrink-0 items-center gap-4">
        {meme.imageUrl && (
          <FadeImage
            src={meme.imageUrl}
            alt=""
            wrapperClassName="size-10 shrink-0 rounded-full sm:size-12"
            className="size-10 rounded-full object-cover sm:size-12"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-lg font-bold text-foreground sm:text-xl">
              {meme.symbol}
            </span>
            <span
              className={cn(
                'text-sm tabular-nums sm:text-base',
                isPositive ? 'text-green-500' : 'text-red-500',
              )}
            >
              {isPositive ? '+' : ''}
              {meme.change.toFixed(2)}%
            </span>
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {meme.name}
          </div>
        </div>
        <div className="shrink-0 text-lg font-semibold tabular-nums text-foreground sm:text-xl">
          ${meme.price < 1 ? meme.price.toFixed(6) : meme.price.toFixed(2)}
        </div>
      </div>

      <div className="min-h-[140px] flex-1 sm:min-h-[180px]">
        <Liveline
          data={chartData}
          value={meme.price}
          color={color}
          theme={isDark ? 'dark' : 'light'}
          badge={false}
          grid={false}
          scrub={false}
          pulse
          fill
          momentum
          paused={isTabHidden}
          padding={HERO_CHART_PADDING}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {formatCompact(meme.liquidity)} Liquidity
      </div>
    </div>
  )
}

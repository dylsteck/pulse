import { useMemo } from 'react'
import { Liveline } from 'liveline'
import type { CarouselTokenItem } from './types'
import { HERO_CHART_PADDING } from './types'
import { FadeImage } from '@/components/ui/fade-image'
import { useDocumentHidden } from '@/hooks/use-document-hidden'
import { useTokenBars } from '@/hooks/use-token-bars'
import { cn } from '@/lib/utils'

const CHART_WINDOW = '1D'

export function AssetCard({
  asset,
  isDark,
}: {
  asset: CarouselTokenItem
  isDark: boolean
}) {
  const isPositive = asset.change >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'
  const isTabHidden = useDocumentHidden()
  const { data: bars } = useTokenBars(asset.id, CHART_WINDOW)

  const chartData = useMemo(() => {
    if (bars.length >= 2) return bars
    if (asset.data.length >= 2) return asset.data
    const now = Date.now() / 1000
    const val = asset.data[0]?.value ?? asset.price
    return [
      { time: now - 86400, value: val },
      { time: now, value: asset.price },
    ]
  }, [bars, asset.data, asset.price])

  return (
    <div className="flex h-full min-h-0 cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30 sm:p-6">
      <div className="flex shrink-0 items-center gap-3">
        {asset.imageUrl && (
          <FadeImage
            src={asset.imageUrl}
            alt=""
            wrapperClassName="size-10 shrink-0 rounded-full sm:size-12"
            className="size-10 rounded-full object-cover sm:size-12"
          />
        )}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-lg font-bold text-foreground sm:text-xl">
            {asset.symbol}
          </span>
          <span
            className={cn(
              'text-sm tabular-nums sm:text-base',
              isPositive ? 'text-green-500' : 'text-red-500',
            )}
          >
            {isPositive ? '+' : ''}
            {asset.change.toFixed(2)}%
          </span>
        </div>
        <span className="text-lg font-semibold tabular-nums text-foreground sm:text-xl">
          $
          {asset.price < 1
            ? asset.price.toFixed(4)
            : asset.price.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
        </span>
      </div>

      <div className="min-h-[140px] flex-1 sm:min-h-[180px]">
        <Liveline
          data={chartData}
          value={asset.price}
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
    </div>
  )
}

import { useEffect, useState, useMemo, useSyncExternalStore } from 'react'
import { Link } from '@tanstack/react-router'
import { Liveline } from 'liveline'
import { useTheme } from '@/components/theme-provider'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'
import type { Market } from '@/lib/types'

const ACCENT_COLOR = '#0066ff'
const HERO_CHART_PADDING = { top: 4, right: 16, bottom: 0, left: 0 } as const

type CarouselItem =
  | {
      kind: 'token'
      id: string
      symbol: string
      name: string
      price: number
      change: number
      data: { time: number; value: number }[]
      imageUrl?: string
    }
  | { kind: 'market'; market: Market }

export function HeroBanner() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { data: tokens } = useLiveTokens(10)
  const { data: markets } = useLiveMarkets()

  const carouselItems: CarouselItem[] = useMemo(() => {
    const tokenItems: CarouselItem[] = (tokens ?? [])
      .filter((t) => t.priceHistory.length >= 2)
      .map((t) => ({
        kind: 'token',
        id: t.id,
        symbol: t.symbol,
        name: t.name,
        price: t.price,
        change: t.change24h,
        data: t.priceHistory,
        imageUrl: t.imageUrl,
      }))

    const marketItems: CarouselItem[] = (markets ?? [])
      .slice(0, 6)
      .map((m) => ({ kind: 'market', market: m }))

    const merged: CarouselItem[] = []
    const maxLen = Math.max(tokenItems.length, marketItems.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < tokenItems.length) merged.push(tokenItems[i]!)
      if (i < marketItems.length) merged.push(marketItems[i]!)
    }
    return merged
  }, [tokens, markets])

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (carouselItems.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [carouselItems.length])

  const currentItem = carouselItems[currentIndex % carouselItems.length]

  return (
    <div className="relative mb-4 w-full overflow-hidden">
      <div className="flex items-start gap-6 px-2 py-2 sm:px-0 sm:py-3">
        <div className="flex-1 pt-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Stay on the <span style={{ color: ACCENT_COLOR }}>pulse</span> of
            crypto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every market, every asset, every chain. One interface.
          </p>
        </div>

        {currentItem && (
          <div className="hidden w-1/2 max-w-lg sm:block">
            {currentItem.kind === 'token' ? (
              <Link
                to="/asset/$type/$id"
                params={{ type: 'tokens', id: currentItem.id }}
              >
                <AssetCard
                  key={currentItem.id}
                  asset={currentItem}
                  isDark={isDark}
                />
              </Link>
            ) : (
              <Link
                to="/asset/$type/$id"
                params={{ type: 'markets', id: currentItem.market.id }}
              >
                <HeroMarketCard
                  key={currentItem.market.id}
                  market={currentItem.market}
                />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function useDocumentHidden() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener('visibilitychange', cb)
      return () => document.removeEventListener('visibilitychange', cb)
    },
    () => document.hidden,
    () => false,
  )
}

function AssetCard({
  asset,
  isDark,
}: {
  asset: Extract<CarouselItem, { kind: 'token' }>
  isDark: boolean
}) {
  const isPositive = asset.change >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'
  const isTabHidden = useDocumentHidden()

  const chartData = useMemo(() => {
    if (asset.data.length >= 2) return asset.data
    const now = Date.now() / 1000
    const val = asset.data[0]?.value ?? asset.price
    return [
      { time: now - 3600, value: val },
      { time: now, value: asset.price },
    ]
  }, [asset.data, asset.price])

  return (
    <div className="flex cursor-pointer flex-col gap-1 animate-in fade-in duration-500">
      <div className="flex items-baseline gap-2">
        {asset.imageUrl && (
          <FadeImage
            src={asset.imageUrl}
            alt=""
            wrapperClassName="size-6 shrink-0 rounded-full"
            className="size-6 rounded-full object-cover"
          />
        )}
        <span className="text-sm font-bold text-foreground">
          {asset.symbol}
        </span>
        <span
          className={cn(
            'text-xs tabular-nums',
            isPositive ? 'text-green-500' : 'text-red-500',
          )}
        >
          {isPositive ? '+' : ''}
          {asset.change.toFixed(2)}%
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          $
          {asset.price < 1
            ? asset.price.toFixed(4)
            : asset.price.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
        </span>
      </div>

      <div className="h-[60px] w-full">
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

function HeroMarketCard({ market }: { market: Market }) {
  const hasOutcomes = market.outcomes && market.outcomes.length > 0

  return (
    <div className="flex cursor-pointer flex-col gap-2 animate-in fade-in duration-500">
      <div className="flex items-start gap-3">
        {market.imageUrl && (
          <FadeImage
            src={market.imageUrl}
            alt=""
            wrapperClassName="size-9 shrink-0 rounded-lg"
            className="size-9 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {market.title}
          </div>
        </div>
      </div>

      {hasOutcomes ? (
        <div className="space-y-1">
          {market.outcomes!.slice(0, 3).map((o) => (
            <div key={o.name} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                {o.name}
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-foreground">
                {Math.round(o.percent)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-[#22c55e]/15 py-1.5 text-center text-xs font-semibold text-[#22c55e] dark:bg-[#22c55e]/20">
            Yes {Math.round(market.yesPercent)}%
          </div>
          <div className="flex-1 rounded-lg bg-[#ef4444]/15 py-1.5 text-center text-xs font-semibold text-[#ef4444] dark:bg-[#ef4444]/20">
            No {Math.round(market.noPercent)}%
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {formatCompact(market.volume)} Vol.
      </div>
    </div>
  )
}

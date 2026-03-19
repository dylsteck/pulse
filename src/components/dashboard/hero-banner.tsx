import { useMemo, useSyncExternalStore } from 'react'
import { Link } from '@tanstack/react-router'
import { Liveline } from 'liveline'
import { ChevronDownIcon, ChevronUpIcon, FlameIcon } from 'lucide-react'
import type { Market } from '@/lib/types'
import type { MemeToken } from '@/lib/geckoterminal'
import { useTheme } from '@/components/theme-provider'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { useMemeTokens } from '@/hooks/use-meme-tokens'
import { FadeImage } from '@/components/ui/fade-image'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'

const ACCENT_COLOR = '#0066ff'
const HERO_CHART_PADDING = { top: 8, right: 24, bottom: 0, left: 0 } as const

type CarouselItem =
  | {
      kind: 'token'
      id: string
      symbol: string
      name: string
      price: number
      change: number
      data: Array<{ time: number; value: number }>
      imageUrl?: string
    }
  | {
      kind: 'meme'
      id: string
      symbol: string
      name: string
      price: number
      change: number
      data: Array<{ time: number; value: number }>
      imageUrl?: string
      liquidity: number
    }
  | { kind: 'market'; market: Market }

type SidebarItem =
  | {
      kind: 'token'
      id: string
      type: 'tokens'
      label: string
      sublabel?: string
      change: number
      volume: number
      price?: number
      imageUrl?: string
    }
  | {
      kind: 'meme'
      id: string
      type: 'memes'
      label: string
      sublabel?: string
      change: number
      volume: number
      price?: number
      imageUrl?: string
    }
  | {
      kind: 'market'
      id: string
      type: 'markets'
      label: string
      change: number
      volume: number
      imageUrl?: string
    }

export function HeroBanner() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { data: tokens } = useLiveTokens(10)
  const { data: markets } = useLiveMarkets()
  const { data: memes } = useMemeTokens()

  const carouselItems: Array<CarouselItem> = useMemo(() => {
    const tokenItems: Array<CarouselItem> = (tokens ?? [])
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

    const memeItems: Array<CarouselItem> = (memes ?? [])
      .slice(0, 6)
      .filter((m) => m.priceHistory.length >= 2)
      .map((m) => ({
        kind: 'meme',
        id: m.id,
        symbol: m.symbol,
        name: m.name,
        price: m.price,
        change: m.change24h,
        data: m.priceHistory,
        imageUrl: m.imageUrl,
        liquidity: m.liquidity,
      }))

    const marketItems: Array<CarouselItem> = (markets ?? [])
      .slice(0, 6)
      .map((m) => ({ kind: 'market', market: m }))

    const merged: Array<CarouselItem> = []
    const maxLen = Math.max(
      tokenItems.length,
      memeItems.length,
      marketItems.length,
    )
    for (let i = 0; i < maxLen; i++) {
      if (i < tokenItems.length) merged.push(tokenItems[i])
      if (i < memeItems.length) merged.push(memeItems[i])
      if (i < marketItems.length) merged.push(marketItems[i])
    }
    return merged
  }, [tokens, markets, memes])

  const sidebarItems = useMemo(() => {
    const items: Array<SidebarItem> = []

    ;(tokens ?? []).forEach((t) => {
      items.push({
        kind: 'token',
        id: t.id,
        type: 'tokens',
        label: t.symbol,
        sublabel: t.name,
        change: t.change24h,
        volume: t.volume24h,
        price: t.price,
        imageUrl: t.imageUrl,
      })
    })
    ;(memes ?? []).forEach((m) => {
      items.push({
        kind: 'meme',
        id: m.id,
        type: 'memes',
        label: m.symbol,
        sublabel: m.name,
        change: m.change24h,
        volume: m.volume24h,
        price: m.price,
        imageUrl: m.imageUrl,
      })
    })
    ;(markets ?? []).forEach((m) => {
      items.push({
        kind: 'market',
        id: m.id,
        type: 'markets',
        label: m.title,
        change: 0,
        volume: m.volume,
        imageUrl: m.imageUrl,
      })
    })

    const seen = new Set<string>()
    const merged: Array<SidebarItem> = []
    const withChange = items.filter(
      (i) => (i.kind === 'token' || i.kind === 'meme') && i.change !== 0,
    )
    const breaking = [...withChange]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5)
    const trending = [...items].sort((a, b) => b.volume - a.volume).slice(0, 5)

    for (const item of [...breaking, ...trending]) {
      const key = `${item.type}-${item.id}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(item)
      }
    }
    return merged.slice(0, 7)
  }, [tokens, markets, memes])

  const currentItem = carouselItems[0]

  return (
    <div
      className={cn(
        'flex w-full flex-col px-2 py-6 sm:px-0 sm:py-8 lg:min-h-[70vh]',
      )}
    >
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        Stay on the <span style={{ color: ACCENT_COLOR }}>pulse</span> of crypto
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
        Every market, every asset, every chain. One interface.
      </p>

      <div
        className={cn(
          'mt-4 hidden flex-1 flex-col gap-6 sm:mt-5 sm:flex-row sm:items-stretch sm:gap-8 lg:flex',
        )}
      >
        {/* Left: Featured card */}
        {currentItem && (
          <div className="hidden min-h-0 w-full max-w-4xl flex-1 flex-col lg:flex">
            {currentItem.kind === 'token' ? (
              <Link
                to="/asset/$type/$id"
                params={{ type: 'tokens', id: currentItem.id }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <AssetCard
                  key={currentItem.id}
                  asset={currentItem}
                  isDark={isDark}
                />
              </Link>
            ) : currentItem.kind === 'meme' ? (
              <Link
                to="/asset/$type/$id"
                params={{ type: 'memes', id: currentItem.id }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <MemeHeroCard meme={currentItem} isDark={isDark} />
              </Link>
            ) : (
              <Link
                to="/asset/$type/$id"
                params={{ type: 'markets', id: currentItem.market.id }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <HeroMarketCard
                  key={currentItem.market.id}
                  market={currentItem.market}
                />
              </Link>
            )}
          </div>
        )}

        {/* Right: Sidebar */}
        <div className="ml-auto flex w-full shrink-0 flex-col sm:w-[320px] lg:w-[360px]">
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card/50 p-4">
            <h3 className="mb-2 flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <FlameIcon className="size-3.5" />
              Top assets
            </h3>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {sidebarItems.length === 0 ? (
                <li className="py-4 text-center text-sm text-muted-foreground">
                  No data yet
                </li>
              ) : (
                sidebarItems.map((item) => (
                  <SidebarRow key={`${item.type}-${item.id}`} item={item} />
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarRow({ item }: { item: SidebarItem }) {
  const isPositive = item.change >= 0
  const ChangeIcon = isPositive ? ChevronUpIcon : ChevronDownIcon

  return (
    <li>
      <Link
        to="/asset/$type/$id"
        params={{ type: item.type, id: item.id }}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
      >
        {item.imageUrl && (
          <FadeImage
            src={item.imageUrl}
            alt=""
            wrapperClassName="size-8 shrink-0 rounded-full"
            className="size-8 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {item.label}
          </div>
          {item.sublabel && (
            <div className="truncate text-xs text-muted-foreground">
              {item.sublabel}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.kind !== 'market' && item.change !== 0 && (
            <span
              className={cn(
                'flex items-center text-xs font-medium tabular-nums',
                isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]',
              )}
            >
              <ChangeIcon className="size-3" />
              {isPositive ? '+' : ''}
              {item.change.toFixed(1)}%
            </span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCompact(item.volume)}
          </span>
        </div>
      </Link>
    </li>
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

function HeroMarketCard({ market }: { market: Market }) {
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

function MemeHeroCard({
  meme,
  isDark,
}: {
  meme: Extract<CarouselItem, { kind: 'meme' }>
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

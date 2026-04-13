import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { FlameIcon } from 'lucide-react'
import { AssetCard, MarketCard, MemeCard, SidebarRow } from './hero'
import type { CarouselItem, SidebarItem } from './hero'
import { useTheme } from '@/components/theme-provider'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { useMemeTokens } from '@/hooks/use-meme-tokens'
import { cn } from '@/lib/utils'
import { buildMarketId, buildMemeId, buildTokenId } from '@/lib/caip19'

const ACCENT_COLOR = '#0066ff'

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
        poolAddress: m.poolAddress,
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
                to="/asset/$identifier"
                params={{ identifier: buildTokenId(currentItem.id) }}
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
                to="/asset/$identifier"
                params={{ identifier: buildMemeId(currentItem.id) }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <MemeCard meme={currentItem} isDark={isDark} />
              </Link>
            ) : (
              <Link
                to="/asset/$identifier"
                params={{ identifier: buildMarketId(currentItem.market.id) }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <MarketCard
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

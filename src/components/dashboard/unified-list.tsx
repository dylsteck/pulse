import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutGridIcon, Rows3Icon } from 'lucide-react'
import {
  LivelineChart,
  WINDOW_SECS_TO_LABEL,
  WINDOW_LABEL_TO_SECS,
} from '@/components/trading/liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useTortoiseSongs, useAudioDetail } from '@/hooks/use-tortoise-songs'
import { usePerpMarkets } from '@/hooks/use-perps'
import { useZoraCreators } from '@/hooks/use-zora-creators'
import { useLiveTokens } from '@/hooks/use-live-tokens'
import { useLiveMarkets } from '@/hooks/use-live-markets'
import { PerpsPanel } from '@/components/perps/perps-panel'
import type { Token } from '@/lib/types'
import type { Market } from '@/lib/types'
import { imageUrl, type Song } from '@/lib/tortoise'
import type { CreatorToken } from '@/lib/zora/service'
import { cn } from '@/lib/utils'
import { FadeImage } from '@/components/ui/fade-image'

function formatCompact(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v}`
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.001) return price.toFixed(6)
  return price.toFixed(8)
}

function formatExpiry(s: string): string {
  return new Date(s).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatCreated(s: string): string {
  return new Date(s).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export type ViewMode = 'tokens' | 'markets' | 'creators' | 'music' | 'perps'
type ViewLayout = 'list' | 'grid'

interface UnifiedListProps {
  initialMode?: ViewMode
  onModeChange?: (mode: ViewMode) => void
}

const MOBILE_BREAKPOINT = 768

let persistedLayout: ViewLayout | null = null

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export function UnifiedList({
  initialMode = 'tokens',
  onModeChange,
}: UnifiedListProps) {
  const isMobile = useIsMobile()
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [layout, setLayoutRaw] = useState<ViewLayout>(persistedLayout ?? 'list')
  const hasSetInitialLayout = useRef(false)

  const setLayout = useCallback((l: ViewLayout) => {
    persistedLayout = l
    setLayoutRaw(l)
  }, [])

  useEffect(() => {
    if (isMobile && !hasSetInitialLayout.current && persistedLayout === null) {
      hasSetInitialLayout.current = true
      setLayout('grid')
    }
  }, [isMobile, setLayout])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const creatorsLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const tokensLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const marketsLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const { data: songsData } = useTortoiseSongs()
  const { data: perpMarkets, isLoading: isPerpsLoading } = usePerpMarkets()
  const creatorsQuery = useZoraCreators(20)
  const creators = creatorsQuery.items
  const liveTokensQuery = useLiveTokens()
  const liveMarketsQuery = useLiveMarkets()
  const liveTokens = liveTokensQuery.data ?? []
  const liveMarkets = liveMarketsQuery.data ?? []

  const items: Array<{ id: string }> =
    mode === 'tokens'
      ? liveTokens
      : mode === 'markets'
        ? liveMarkets
        : mode === 'creators'
          ? creators
          : mode === 'music'
            ? (songsData?.songs ?? [])
            : (perpMarkets ?? [])

  useEffect(() => {
    setMode(initialMode)
    setExpandedId(null)
    setSelectedIndex(0)
  }, [initialMode])

  useEffect(() => {
    onModeChange?.(mode)
  }, [mode, onModeChange])

  useEffect(() => {
    if (!items.length) {
      setSelectedIndex(0)
      return
    }
    setSelectedIndex((current) => Math.min(current, items.length - 1))
  }, [items.length])

  useEffect(() => {
    if (layout !== 'list') return

    function handleKey(e: KeyboardEvent) {
      if (!items.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = Math.min(i + 1, items.length - 1)
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => {
          const next = Math.max(i - 1, 0)
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
      } else if (e.key === 'Enter') {
        const item = items[selectedIndex]
        if (!item) return
        setExpandedId((prev) => (prev === item.id ? null : item.id))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [items, selectedIndex, layout])

  useEffect(() => {
    if (mode !== 'creators') return
    if (!creatorsQuery.hasNextPage || creatorsQuery.isFetchingNextPage) return
    const target = creatorsLoadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry?.isIntersecting &&
          creatorsQuery.hasNextPage &&
          !creatorsQuery.isFetchingNextPage
        ) {
          void creatorsQuery.fetchNextPage()
        }
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [
    mode,
    creatorsQuery.hasNextPage,
    creatorsQuery.isFetchingNextPage,
    creatorsQuery.fetchNextPage,
  ])

  useEffect(() => {
    if (mode !== 'tokens') return
    if (!liveTokensQuery.hasMore || liveTokensQuery.isFetching) return
    const target = tokensLoadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry?.isIntersecting &&
          liveTokensQuery.hasMore &&
          !liveTokensQuery.isFetching
        ) {
          liveTokensQuery.loadMore()
        }
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [
    mode,
    liveTokensQuery.hasMore,
    liveTokensQuery.isFetching,
    liveTokensQuery.loadMore,
  ])

  useEffect(() => {
    if (mode !== 'markets') return
    if (!liveMarketsQuery.hasMore || liveMarketsQuery.isFetching) return
    const target = marketsLoadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry?.isIntersecting &&
          liveMarketsQuery.hasMore &&
          !liveMarketsQuery.isFetching
        ) {
          liveMarketsQuery.loadMore()
        }
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [
    mode,
    liveMarketsQuery.hasMore,
    liveMarketsQuery.isFetching,
    liveMarketsQuery.loadMore,
  ])

  const handleRowClick = (index: number) => {
    if (!items.length) return
    setSelectedIndex(index)
    const item = items[index]
    if (!item) return
    setExpandedId((prev) => (prev === item.id ? null : item.id))
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-37px)] w-full max-w-6xl flex-col py-2 sm:px-6">
      <div className="mb-2 flex items-end justify-between gap-2 px-2 sm:px-0">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-1 sm:gap-5 sm:overflow-visible">
          {(
            ['tokens', 'markets', 'creators', 'music', 'perps'] as ViewMode[]
          ).map((tab) => {
            const active = mode === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab)
                  setExpandedId(null)
                  setSelectedIndex(0)
                }}
                className={cn(
                  'shrink-0 text-sm font-medium capitalize transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            )
          })}
        </div>

        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLayout('list')}
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-md transition-colors',
              layout === 'list'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="List view"
            title="List view"
          >
            <Rows3Icon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setLayout('grid')}
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-md transition-colors',
              layout === 'grid'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGridIcon className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto scrollbar-none',
          layout === 'grid' && 'px-2 sm:px-0',
        )}
      >
        {layout === 'list' ? (
          mode === 'tokens' ? (
            liveTokensQuery.isLoading ? (
              <LoadingPanel label="Loading live token data..." />
            ) : liveTokensQuery.error ? (
              <ErrorPanel
                label={
                  liveTokensQuery.error instanceof Error
                    ? liveTokensQuery.error.message
                    : 'Failed to load live token data.'
                }
              />
            ) : (
              <TokenTable
                tokens={liveTokens}
                selectedIndex={selectedIndex}
                expandedId={expandedId}
                rowRefs={rowRefs}
                onRowClick={handleRowClick}
              />
            )
          ) : mode === 'markets' ? (
            liveMarketsQuery.isLoading ? (
              <LoadingPanel label="Loading Polymarket events..." />
            ) : liveMarketsQuery.error ? (
              <ErrorPanel
                label={
                  liveMarketsQuery.error instanceof Error
                    ? liveMarketsQuery.error.message
                    : 'Failed to load live market data.'
                }
              />
            ) : (
              <MarketTable
                markets={liveMarkets}
                selectedIndex={selectedIndex}
                expandedId={expandedId}
                rowRefs={rowRefs}
                onRowClick={handleRowClick}
              />
            )
          ) : mode === 'creators' ? (
            <CreatorsTable
              creators={creators}
              isLoading={creatorsQuery.isLoading}
              selectedIndex={selectedIndex}
              expandedId={expandedId}
              rowRefs={rowRefs}
              onRowClick={handleRowClick}
            />
          ) : mode === 'music' ? (
            <MusicTable
              songs={songsData?.songs ?? []}
              isLoading={!songsData}
              selectedIndex={selectedIndex}
              expandedId={expandedId}
              rowRefs={rowRefs}
              onRowClick={handleRowClick}
            />
          ) : (
            <PerpsPanel
              markets={perpMarkets ?? []}
              isLoading={isPerpsLoading}
              layout="list"
              selectedIndex={selectedIndex}
              expandedId={expandedId}
              rowRefs={rowRefs}
              onRowClick={handleRowClick}
            />
          )
        ) : mode === 'tokens' ? (
          liveTokensQuery.isLoading ? (
            <LoadingPanel label="Loading live token data..." />
          ) : liveTokensQuery.error ? (
            <ErrorPanel
              label={
                liveTokensQuery.error instanceof Error
                  ? liveTokensQuery.error.message
                  : 'Failed to load live token data.'
              }
            />
          ) : (
            <TokenGrid tokens={liveTokens} />
          )
        ) : mode === 'markets' ? (
          liveMarketsQuery.isLoading ? (
            <LoadingPanel label="Loading Polymarket events..." />
          ) : liveMarketsQuery.error ? (
            <ErrorPanel
              label={
                liveMarketsQuery.error instanceof Error
                  ? liveMarketsQuery.error.message
                  : 'Failed to load live market data.'
              }
            />
          ) : (
            <MarketGrid markets={liveMarkets} />
          )
        ) : mode === 'creators' ? (
          <CreatorsGrid
            creators={creators}
            isLoading={creatorsQuery.isLoading}
          />
        ) : mode === 'music' ? (
          <MusicGrid songs={songsData?.songs ?? []} isLoading={!songsData} />
        ) : (
          <PerpsPanel
            markets={perpMarkets ?? []}
            isLoading={isPerpsLoading}
            layout="grid"
            selectedIndex={selectedIndex}
            expandedId={expandedId}
            rowRefs={rowRefs}
            onRowClick={handleRowClick}
          />
        )}
        {mode === 'creators' && creatorsQuery.hasNextPage && (
          <div ref={creatorsLoadMoreRef} className="h-6" aria-hidden />
        )}
        {mode === 'tokens' && liveTokensQuery.hasMore && (
          <div ref={tokensLoadMoreRef} className="h-6" aria-hidden />
        )}
        {mode === 'markets' && liveMarketsQuery.hasMore && (
          <div ref={marketsLoadMoreRef} className="h-6" aria-hidden />
        )}
      </div>
    </div>
  )
}

function LoadingPanel(_props?: { label?: string }) {
  return (
    <div className="w-full overflow-hidden border-y border-border sm:rounded-xl sm:border-x">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-3 py-3 last:border-0 sm:px-6"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function ErrorPanel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center border-y border-border py-16 text-sm text-[#ef4444] sm:rounded-xl sm:border-x">
      {label}
    </div>
  )
}

interface TokenTableProps {
  tokens: Token[]
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
}

function TokenTable({
  tokens,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: TokenTableProps) {
  const gridCols = 'grid-cols-[2fr_1fr_0.7fr_0.8fr_0.8fr]'
  return (
    <div className="w-full overflow-hidden border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Token
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Price
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h %
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Volume
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mkt Cap
        </span>
      </div>

      {tokens.map((token, i) => {
        const selected = i === selectedIndex
        const expanded = expandedId === token.id
        return (
          <div key={token.id} className="border-b border-border last:border-0">
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
                {token.imageUrl && (
                  <FadeImage
                    src={token.imageUrl}
                    alt=""
                    wrapperClassName="size-7 shrink-0 rounded-full"
                    className="size-7 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-sm font-semibold">{token.symbol}</span>
                  <div className="truncate text-xs text-muted-foreground">
                    {token.name}
                  </div>
                </div>
              </div>
              <span className="text-right text-sm tabular-nums">
                ${formatPrice(token.price)}
              </span>
              <span
                className={cn(
                  'text-right text-sm tabular-nums',
                  token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                )}
              >
                {token.change24h >= 0 ? '+' : ''}
                {token.change24h.toFixed(2)}%
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {formatCompact(token.volume24h)}
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {formatCompact(token.marketCap)}
              </span>
            </button>

            {expanded && (
              <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                <InlineTokenChart token={token} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InlineTokenChart({ token }: { token: Token }) {
  const { price } = useTokenPrice(token)
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useTokenBars(token.address, windowLabel)
  const chartData = bars.length >= 2 ? bars : token.priceHistory

  // Guard against Liveline firing onWindowChange on mount/data-change
  // which causes the timeframe to snap back to default
  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel]!)
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{token.symbol}</span>
        <span className="text-lg font-semibold tabular-nums">
          ${formatPrice(price)}
        </span>
      </div>
      {isLoading && bars.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <LivelineChart
          data={chartData}
          value={price}
          height={220}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
        />
      )}
    </div>
  )
}

interface MarketTableProps {
  markets: Market[]
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
}

function MarketTable({
  markets,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: MarketTableProps) {
  const gridCols = 'grid-cols-[3fr_0.6fr_0.8fr_0.8fr]'
  return (
    <div className="w-full overflow-hidden border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
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

      {markets.map((market, i) => {
        const selected = i === selectedIndex
        const expanded = expandedId === market.id
        return (
          <div key={market.id} className="border-b border-border last:border-0">
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
                {formatExpiry(market.expiry)}
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
  )
}

function InlineMarketChart({ market }: { market: Market }) {
  const { yesPercent, history } = useMarketOdds(market)

  const chartData =
    history.length >= 2
      ? history
      : history.length === 1
        ? [
            { time: history[0]!.time - 60, value: history[0]!.value },
            history[0]!,
          ]
        : [
            { time: Date.now() / 1000 - 60, value: yesPercent },
            { time: Date.now() / 1000, value: yesPercent },
          ]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium">{market.title}</span>
        <span className="text-sm font-semibold text-[#22c55e]">
          {Math.round(yesPercent)}% Yes
        </span>
      </div>
      <LivelineChart
        data={chartData}
        value={yesPercent}
        height={220}
        formatValue={(v) => `${Math.round(v)}%`}
      />
    </div>
  )
}

interface MusicTableProps {
  songs: Song[]
  isLoading: boolean
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
}

function MusicTable({
  songs,
  isLoading,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: MusicTableProps) {
  const gridCols = 'grid-cols-[2fr_1.5fr_0.7fr_0.6fr_0.8fr]'
  if (isLoading) {
    return <LoadingPanel />
  }
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        No songs found
      </div>
    )
  }
  return (
    <div className="w-full overflow-hidden border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Title
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Artist
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Collections
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Type
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Created
        </span>
      </div>

      {songs.map((song, i) => {
        const selected = i === selectedIndex
        const expanded = expandedId === song.id
        return (
          <div key={song.id} className="border-b border-border last:border-0">
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
                <FadeImage
                  src={imageUrl(song.image_ipfs_cid)}
                  alt=""
                  wrapperClassName="size-7 shrink-0 rounded-sm"
                  className="size-7 rounded-sm object-cover"
                />
                <span className="truncate text-sm">{song.title}</span>
              </div>
              <span className="truncate text-sm text-muted-foreground">
                {song.artist}
              </span>
              <span className="text-right text-sm tabular-nums">
                {song.collection_count}
              </span>
              <span className="text-right text-xs text-muted-foreground capitalize">
                {song.media_type}
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {formatCreated(song.created_at)}
              </span>
            </button>

            {expanded && (
              <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                <InlineSongDetail song={song} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InlineSongDetail({ song }: { song: Song }) {
  const { data: audio, isLoading } = useAudioDetail(song.url_slug)
  const coverUrl = imageUrl(song.image_ipfs_cid)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex gap-4">
        <FadeImage
          src={coverUrl}
          alt=""
          wrapperClassName="size-24 shrink-0 rounded-lg"
          className="size-24 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{song.title}</h3>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{song.collection_count} collections</span>
            {audio && <span>{audio.price} ETH</span>}
          </div>
          {isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
          ) : audio?.url ? (
            <div className="mt-3">
              <audio controls src={audio.url} className="w-full max-w-md" />
            </div>
          ) : null}
          <a
            href={`https://tortoise.studio/song/${song.url_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
          >
            Collect on Tortoise
          </a>
        </div>
      </div>
    </div>
  )
}

interface CreatorsTableProps {
  creators: CreatorToken[]
  isLoading: boolean
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
}

function CreatorsTable({
  creators,
  isLoading,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: CreatorsTableProps) {
  const gridCols = 'grid-cols-[1.7fr_0.8fr_0.8fr_0.8fr_0.7fr]'

  if (isLoading) {
    return <LoadingPanel />
  }

  if (creators.length === 0) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        No tokens found
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Token
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mkt Cap
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h %
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h Vol
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Holders
        </span>
      </div>

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
  )
}

function InlineCreatorChart({ creator }: { creator: CreatorToken }) {
  if (creator.sparkline.length < 2) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
        No chart data available.
      </div>
    )
  }

  const last = creator.sparkline.at(-1)
  if (!last) return null

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{creator.symbol}</span>
        <span className="text-lg font-semibold tabular-nums">
          ${last.value.toFixed(last.value >= 1 ? 4 : 8)}
        </span>
      </div>
      <LivelineChart
        data={creator.sparkline}
        value={last.value}
        height={220}
        color={creator.marketCapDelta24h >= 0 ? '#22c55e' : '#ef4444'}
      />
    </div>
  )
}

const TokenGridCard = React.memo(function TokenGridCard({
  token,
}: {
  token: Token
}) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'tokens', id: token.id }}
      className="block overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {token.imageUrl && (
            <FadeImage
              src={token.imageUrl}
              alt=""
              wrapperClassName="size-7 shrink-0 rounded-full"
              className="size-7 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold">{token.symbol}</div>
            <div className="truncate text-xs text-muted-foreground">
              {token.name}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div
          className={cn(
            'text-xs tabular-nums',
            token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
          )}
        >
          {token.change24h >= 0 ? '+' : ''}
          {token.change24h.toFixed(2)}%
        </div>
      </div>
      <div className="mt-3 text-lg tabular-nums">
        ${formatPrice(token.price)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Volume</span>
        <span className="text-right">{formatCompact(token.volume24h)}</span>
        <span className="text-muted-foreground">Mkt Cap</span>
        <span className="text-right">{formatCompact(token.marketCap)}</span>
      </div>
    </Link>
  )
})

const CreatorGridCard = React.memo(function CreatorGridCard({
  creator,
}: {
  creator: CreatorToken
}) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'creators', id: creator.id }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {creator.imageUrl && (
            <FadeImage
              src={creator.imageUrl}
              alt=""
              wrapperClassName="size-9 shrink-0 rounded-full"
              className="size-9 rounded-full object-cover"
            />
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="truncate text-sm font-semibold">
              {creator.symbol}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {creator.creatorHandle ?? creator.name}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'text-xs font-medium tabular-nums',
            creator.marketCapDelta24h >= 0
              ? 'text-[#22c55e]'
              : 'text-[#ef4444]',
          )}
        >
          {creator.marketCapDelta24h >= 0 ? '+' : ''}
          {creator.marketCapDelta24h.toFixed(2)}%
        </div>
      </div>
      <div className="mt-auto pt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Mkt Cap</span>
        <span className="text-right tabular-nums">
          {formatCompact(creator.marketCap)}
        </span>
        <span className="text-muted-foreground">24h Vol</span>
        <span className="text-right tabular-nums">
          {formatCompact(creator.volume24h)}
        </span>
        <span className="text-muted-foreground">Holders</span>
        <span className="text-right tabular-nums">
          {creator.uniqueHolders.toLocaleString('en-US')}
        </span>
      </div>
    </Link>
  )
})

function ChanceGauge({
  percent,
  size = 56,
}: {
  percent: number
  size?: number
}) {
  const stroke = 5
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2

  const startAngle = 220
  const endAngle = 500
  const totalArc = endAngle - startAngle
  const fillAngle = startAngle + (totalArc * Math.min(percent, 100)) / 100

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const arcPoint = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  })

  const bgStart = arcPoint(startAngle)
  const bgEnd = arcPoint(endAngle)
  const bgLargeArc = totalArc > 180 ? 1 : 0
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`

  const fillEnd = arcPoint(fillAngle)
  const fillSweep = fillAngle - startAngle
  const fillLargeArc = fillSweep > 180 ? 1 : 0
  const fillPath =
    fillSweep > 0.5
      ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${fillLargeArc} 1 ${fillEnd.x} ${fillEnd.y}`
      : ''

  const color = percent >= 50 ? '#22c55e' : '#ef4444'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-muted-foreground/25"
        />
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold leading-none text-foreground">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  )
}

const MarketGridCard = React.memo(function MarketGridCard({
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

const MusicGridCard = React.memo(function MusicGridCard({
  song,
}: {
  song: Song
}) {
  return (
    <Link
      to="/asset/$type/$id"
      params={{ type: 'music', id: song.id }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
    >
      <div className="flex items-start gap-3">
        <FadeImage
          src={imageUrl(song.image_ipfs_cid)}
          alt=""
          wrapperClassName="size-12 shrink-0 rounded-lg"
          className="size-12 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="truncate text-sm font-medium leading-snug">
            {song.title}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {song.artist}
          </div>
        </div>
      </div>
      <div className="mt-auto pt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Collections</span>
        <span className="text-right tabular-nums">{song.collection_count}</span>
        <span className="text-muted-foreground">Type</span>
        <span className="text-right capitalize">{song.media_type}</span>
      </div>
    </Link>
  )
})

function TokenGrid({ tokens }: { tokens: Token[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {tokens.map((token) => (
        <TokenGridCard key={token.id} token={token} />
      ))}
    </div>
  )
}

function CreatorsGrid({
  creators,
  isLoading,
}: {
  creators: CreatorToken[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <LoadingPanel />
  }
  if (creators.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No tokens found
      </div>
    )
  }

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {creators.map((creator) => (
        <CreatorGridCard key={creator.id} creator={creator} />
      ))}
    </div>
  )
}

function MarketGrid({ markets }: { markets: Market[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {markets.map((market) => (
        <MarketGridCard key={market.id} market={market} />
      ))}
    </div>
  )
}

function MusicGrid({
  songs,
  isLoading,
}: {
  songs: Song[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <LoadingPanel />
  }
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No songs found
      </div>
    )
  }
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {songs.map((song) => (
        <MusicGridCard key={song.id} song={song} />
      ))}
    </div>
  )
}

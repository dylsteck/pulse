import { useState, useEffect, useRef } from 'react'
import { LayoutGridIcon, Rows3Icon } from 'lucide-react'
import { LivelineChart } from '@/components/trading/liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useTortoiseSongs, useAudioDetail } from '@/hooks/use-tortoise-songs'
import { TOKENS, type Token } from '@/lib/mock/tokens'
import { MARKETS, type Market } from '@/lib/mock/markets'
import { imageUrl, type Song } from '@/lib/tortoise'
import { cn } from '@/lib/utils'

function formatCompact(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v}`
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.001) return price.toFixed(6)
  return price.toFixed(8)
}

function formatExpiry(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCreated(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export type ViewMode = 'tokens' | 'markets' | 'music'
type ViewLayout = 'list' | 'grid'

interface UnifiedListProps {
  initialMode?: ViewMode
  onModeChange?: (mode: ViewMode) => void
}

export function UnifiedList({ initialMode = 'tokens', onModeChange }: UnifiedListProps) {
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [layout, setLayout] = useState<ViewLayout>('list')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { data: songsData } = useTortoiseSongs()

  const items: Array<{ id: string }> =
    mode === 'tokens'
      ? TOKENS
      : mode === 'markets'
        ? MARKETS
        : (songsData?.songs ?? [])

  useEffect(() => {
    setMode(initialMode)
    setExpandedId(null)
    setSelectedIndex(0)
  }, [initialMode])

  useEffect(() => {
    onModeChange?.(mode)
  }, [mode, onModeChange])

  useEffect(() => {
    if (layout !== 'list') return

    function handleKey(e: KeyboardEvent) {
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

  const handleRowClick = (index: number) => {
    setSelectedIndex(index)
    const item = items[index]
    setExpandedId((prev) => (prev === item.id ? null : item.id))
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-37px)] max-w-6xl flex-col px-4 py-2 sm:px-6">
      <div className="mb-2 flex items-end justify-between">
        <div className="flex items-center gap-5">
          {(['tokens', 'markets', 'music'] as ViewMode[]).map((tab) => {
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
                  'text-sm font-medium capitalize transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
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

      <div className="flex-1 overflow-y-auto">
        {layout === 'list' ? (
          mode === 'tokens' ? (
            <TokenTable
              tokens={TOKENS}
              selectedIndex={selectedIndex}
              expandedId={expandedId}
              rowRefs={rowRefs}
              onRowClick={handleRowClick}
            />
          ) : mode === 'markets' ? (
            <MarketTable
              markets={MARKETS}
              selectedIndex={selectedIndex}
              expandedId={expandedId}
              rowRefs={rowRefs}
              onRowClick={handleRowClick}
            />
          ) : (
            <MusicTable
              songs={songsData?.songs ?? []}
              isLoading={!songsData}
              selectedIndex={selectedIndex}
              expandedId={expandedId}
              rowRefs={rowRefs}
              onRowClick={handleRowClick}
            />
          )
        ) : (
          mode === 'tokens' ? (
            <TokenGrid tokens={TOKENS} />
          ) : mode === 'markets' ? (
            <MarketGrid markets={MARKETS} />
          ) : (
            <MusicGrid songs={songsData?.songs ?? []} isLoading={!songsData} />
          )
        )}
      </div>
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

function TokenTable({ tokens, selectedIndex, expandedId, rowRefs, onRowClick }: TokenTableProps) {
  const gridCols = 'grid-cols-[2fr_1fr_0.7fr_0.8fr_0.8fr_32px]'
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-4 py-2 sm:px-6',
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
        <span />
      </div>

      {tokens.map((token, i) => {
        const selected = i === selectedIndex
        const expanded = expandedId === token.id
        return (
          <div key={token.id} className="border-b border-border last:border-0">
            <button
              ref={(el) => { rowRefs.current[i] = el }}
              type="button"
              onClick={() => onRowClick(i)}
              className={cn(
                'grid w-full items-center gap-4 border-l-2 px-4 py-3 text-left transition-colors sm:px-6',
                gridCols,
                selected ? 'border-l-foreground bg-accent' : 'border-l-transparent hover:bg-accent/40',
              )}
              aria-selected={selected}
              aria-expanded={expanded}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold">{token.symbol}</span>
                <span className="truncate text-xs text-muted-foreground">{token.name}</span>
              </div>
              <span className="text-right font-mono text-sm tabular-nums">
                ${formatPrice(token.price)}
              </span>
              <span
                className={cn(
                  'text-right font-mono text-sm tabular-nums',
                  token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                )}
              >
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCompact(token.volume24h)}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCompact(token.marketCap)}
              </span>
              <span />
            </button>

            {expanded && (
              <div className="border-t border-border bg-muted/30 px-4 py-4 sm:px-6">
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
  const { price, history } = useTokenPrice(token)
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-sm font-semibold">{token.symbol}</span>
        <span className="font-mono text-lg font-semibold tabular-nums">${formatPrice(price)}</span>
      </div>
      <LivelineChart data={history} value={price} height={220} />
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

function MarketTable({ markets, selectedIndex, expandedId, rowRefs, onRowClick }: MarketTableProps) {
  const gridCols = 'grid-cols-[3fr_0.6fr_0.8fr_0.8fr_32px]'
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-4 py-2 sm:px-6',
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
        <span />
      </div>

      {markets.map((market, i) => {
        const selected = i === selectedIndex
        const expanded = expandedId === market.id
        return (
          <div key={market.id} className="border-b border-border last:border-0">
            <button
              ref={(el) => { rowRefs.current[i] = el }}
              type="button"
              onClick={() => onRowClick(i)}
              className={cn(
                'grid w-full items-center gap-4 border-l-2 px-4 py-3 text-left transition-colors sm:px-6',
                gridCols,
                selected ? 'border-l-foreground bg-accent' : 'border-l-transparent hover:bg-accent/40',
              )}
              aria-selected={selected}
              aria-expanded={expanded}
            >
              <span className="text-sm">{market.title}</span>
              <span className="text-right font-mono text-sm tabular-nums">{market.yesPercent}%</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCompact(market.volume)}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatExpiry(market.expiry)}
              </span>
              <span />
            </button>

            {expanded && (
              <div className="border-t border-border bg-muted/30 px-4 py-4 sm:px-6">
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
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium">{market.title}</span>
        <span className="font-mono text-sm font-semibold text-[#22c55e]">{yesPercent.toFixed(1)}% Yes</span>
      </div>
      <LivelineChart
        data={history}
        value={yesPercent}
        height={220}
        formatValue={(v) => `${v.toFixed(1)}%`}
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
  const gridCols = 'grid-cols-[2fr_1.5fr_0.7fr_0.6fr_0.8fr_32px]'
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        Loading music…
      </div>
    )
  }
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No songs found
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-4 py-2 sm:px-6',
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
        <span />
      </div>

      {songs.map((song, i) => {
        const selected = i === selectedIndex
        const expanded = expandedId === song.id
        return (
          <div key={song.id} className="border-b border-border last:border-0">
            <button
              ref={(el) => { rowRefs.current[i] = el }}
              type="button"
              onClick={() => onRowClick(i)}
              className={cn(
                'grid w-full items-center gap-4 border-l-2 px-4 py-3 text-left transition-colors sm:px-6',
                gridCols,
                selected ? 'border-l-foreground bg-accent' : 'border-l-transparent hover:bg-accent/40',
              )}
              aria-selected={selected}
              aria-expanded={expanded}
            >
              <span className="truncate text-sm">{song.title}</span>
              <span className="truncate text-sm text-muted-foreground">{song.artist}</span>
              <span className="text-right font-mono text-sm tabular-nums">{song.collection_count}</span>
              <span className="text-right text-xs text-muted-foreground capitalize">{song.media_type}</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatCreated(song.created_at)}
              </span>
              <span />
            </button>

            {expanded && (
              <div className="border-t border-border bg-muted/30 px-4 py-4 sm:px-6">
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
        <img
          src={coverUrl}
          alt=""
          className="size-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{song.title}</h3>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{song.collection_count} collections</span>
            {audio && (
              <span>{audio.price} ETH</span>
            )}
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

function TokenGrid({ tokens }: { tokens: Token[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <div key={token.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-sm font-semibold">{token.symbol}</div>
              <div className="text-xs text-muted-foreground">{token.name}</div>
            </div>
            <div
              className={cn(
                'text-xs font-mono tabular-nums',
                token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
              )}
            >
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </div>
          </div>
          <div className="mt-3 font-mono text-lg tabular-nums">${formatPrice(token.price)}</div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Volume</span>
            <span className="text-right font-mono">{formatCompact(token.volume24h)}</span>
            <span className="text-muted-foreground">Mkt Cap</span>
            <span className="text-right font-mono">{formatCompact(token.marketCap)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketGrid({ markets }: { markets: Market[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => (
        <div key={market.id} className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-medium leading-snug">{market.title}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Yes {market.yesPercent}%</span>
            <span>No {market.noPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[#22c55e]" style={{ width: `${market.yesPercent}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Volume</span>
            <span className="text-right font-mono">{formatCompact(market.volume)}</span>
            <span className="text-muted-foreground">Expires</span>
            <span className="text-right font-mono">{formatExpiry(market.expiry)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MusicGrid({ songs, isLoading }: { songs: Song[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        Loading music…
      </div>
    )
  }
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        No songs found
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <div key={song.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <img src={imageUrl(song.image_ipfs_cid)} alt="" className="size-14 rounded-md object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{song.title}</div>
              <div className="truncate text-xs text-muted-foreground">{song.artist}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Collections</span>
            <span className="text-right font-mono">{song.collection_count}</span>
            <span className="text-muted-foreground">Type</span>
            <span className="text-right capitalize">{song.media_type}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

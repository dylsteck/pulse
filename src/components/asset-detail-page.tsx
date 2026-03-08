import { useCallback, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { CreatorToken } from '@/lib/zora/service'
import type { Market, Token } from '@/lib/types'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { ArrowLeft } from 'lucide-react'
import type { Song } from '@/lib/tortoise'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { useTokenPrice } from '@/hooks/use-token-price'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useAudioDetail, useTortoiseSongs } from '@/hooks/use-tortoise-songs'
import { usePerpMarkets } from '@/hooks/use-perps'
import { useMemeTokenDetail } from '@/hooks/use-meme-tokens'
import { useMemeOhlcv } from '@/hooks/use-meme-ohlcv'
import { useZoraCreators } from '@/hooks/use-zora-creators'
import { fetchCodexTokenByAddress } from '@/lib/codex'
import type { MemeToken } from '@/lib/geckoterminal'
import { fetchPolymarketEventById } from '@/lib/polymarket'
import { FadeImage } from '@/components/ui/fade-image'
import { imageUrl } from '@/lib/tortoise'
import { formatPerpPrice } from '@/lib/hyperliquid/service'
import { cn } from '@/lib/utils'
import { formatCompact, formatPrice, formatDate } from '@/lib/format'

const BACK_ROUTES: Record<string, string> = {
  tokens: '/tokens',
  markets: '/markets',
  creators: '/creators',
  music: '/music',
  perps: '/perps',
  memes: '/memes',
}

export function AssetDetailPage({ type, id }: { type: string; id: string }) {
  const navigate = useNavigate()
  const backTo = BACK_ROUTES[type] ?? '/tokens'

  return (
    <div className="mx-auto flex min-h-[calc(100vh-37px)] w-full max-w-6xl flex-col px-3 py-4 sm:px-6">
      <button
        type="button"
        onClick={() => navigate({ to: backTo })}
        className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {type === 'tokens' && <TokenDetail id={id} />}
      {type === 'markets' && <MarketDetail id={id} />}
      {type === 'creators' && <CreatorDetail id={id} />}
      {type === 'music' && <MusicDetail id={id} />}
      {type === 'perps' && <PerpDetail id={id} />}
      {type === 'memes' && <MemesDetail id={id} />}
      {!['tokens', 'markets', 'creators', 'music', 'perps', 'memes'].includes(type) && (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Unknown asset type
        </div>
      )}
    </div>
  )
}

function TokenDetail({ id }: { id: string }) {
  const {
    data: token,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['codex', 'token', id],
    queryFn: () => fetchCodexTokenByAddress(id),
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load token
      </div>
    )
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Token not found
      </div>
    )
  }
  return <TokenDetailContent token={token} />
}

function TokenDetailContent({ token }: { token: Token }) {
  const { price } = useTokenPrice(token)
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useTokenBars(token.address, windowLabel)
  const chartData = bars.length >= 2 ? bars : token.priceHistory

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {token.imageUrl && (
              <FadeImage
                src={token.imageUrl}
                alt=""
                wrapperClassName="size-14 shrink-0 rounded-full"
                className="size-14 rounded-full object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{token.symbol}</h1>
                <span
                  className={cn(
                    'rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-xs font-medium',
                    token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                  )}
                >
                  {token.change24h >= 0 ? '+' : ''}
                  {token.change24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{token.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl tabular-nums">${formatPrice(price)}</div>
            <p className="text-xs text-muted-foreground">Current Price</p>
          </div>
        </div>
        <LivelineChart
          data={chartData}
          value={price}
          height={380}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={isLoading && chartData.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Volume 24h
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {token.volume24h > 0 ? formatCompact(token.volume24h) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market Cap
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {token.marketCap > 0 ? formatCompact(token.marketCap) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h High
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {price > 0 ? formatPrice(price * 1.05) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Low
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {price > 0 ? formatPrice(price * 0.95) : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Token Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Contract</span>
            <a
              href={`https://basescan.org/address/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {token.address.slice(0, 6)}...{token.address.slice(-4)}
              <svg
                className="size-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Token ID</span>
            <span className="font-mono text-xs">{token.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarketDetail({ id }: { id: string }) {
  const {
    data: market,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['polymarket', 'event', id],
    queryFn: () => fetchPolymarketEventById(id),
  })

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-2 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load market
      </div>
    )
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Market not found
      </div>
    )
  }
  return <MarketDetailContent market={market} />
}

function MarketDetailContent({ market }: { market: Market }) {
  const { yesPercent } = useMarketOdds(market)
  const [windowLabel, setWindowLabel] = useState('1D')
  const { data: history, isLoading } = useMarketHistory(
    market.clobTokenId,
    windowLabel,
  )

  const chartData =
    history.length >= 2
      ? history
      : [
          { time: Date.now() / 1000 - 60, value: yesPercent },
          { time: Date.now() / 1000, value: yesPercent },
        ]

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="mb-3 text-2xl font-semibold leading-tight sm:text-3xl">
              {market.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {market.clobTokenId && (
                <span className="font-mono text-xs">
                  ID: {market.clobTokenId.slice(0, 8)}...
                </span>
              )}
              <span>Ends {formatDate(market.expiry)}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#22c55e]/15 px-4 py-2 transition-all hover:bg-[#22c55e]/25"
            >
              <span className="text-sm font-medium text-[#22c55e]">Yes</span>
              <span className="font-semibold text-[#22c55e]">
                {yesPercent.toFixed(0)}%
              </span>
            </button>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#ef4444]/15 px-4 py-2 transition-all hover:bg-[#ef4444]/25"
            >
              <span className="text-sm font-medium text-[#ef4444]">No</span>
              <span className="font-semibold text-[#ef4444]">
                {(100 - yesPercent).toFixed(0)}%
              </span>
            </button>
          </div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#22c55e] transition-all"
            style={{ width: `${yesPercent}%` }}
          />
        </div>

        <LivelineChart
          data={chartData}
          value={yesPercent}
          height={340}
          formatValue={(v) => `${v.toFixed(1)}%`}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={isLoading && history.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Volume</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(market.volume)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Yes</p>
          <p className="text-lg font-semibold tabular-nums text-[#22c55e]">
            ${(yesPercent / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">No</p>
          <p className="text-lg font-semibold tabular-nums text-[#ef4444]">
            ${((100 - yesPercent) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {market.outcomes && market.outcomes.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Other Outcomes
          </h2>
          <div className="space-y-3">
            {market.outcomes.map((outcome) => (
              <div
                key={outcome.name}
                className="flex items-center justify-between rounded-lg bg-card/50 p-3"
              >
                <span className="font-medium">{outcome.name}</span>
                <span className="font-semibold tabular-nums">
                  {outcome.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CreatorDetail({ id }: { id: string }) {
  const creatorsQuery = useZoraCreators(100)
  const creator = creatorsQuery.items.find((c) => c.id === id)
  if (creatorsQuery.isLoading || !creator) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        {creatorsQuery.isLoading ? 'Loading…' : 'Creator not found'}
      </div>
    )
  }
  return <CreatorDetailContent creator={creator} />
}

function CreatorDetailContent({ creator }: { creator: CreatorToken }) {
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading: barsLoading } = useTokenBars(
    creator.address,
    windowLabel,
  )
  const chartData =
    bars.length >= 2
      ? bars
      : creator.sparkline.length >= 2
        ? creator.sparkline
        : []

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const lastValue = chartData.at(-1)?.value ?? 0
  const color = creator.marketCapDelta24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {creator.imageUrl && (
              <FadeImage
                src={creator.imageUrl}
                alt=""
                wrapperClassName="size-14 shrink-0 rounded-lg"
                className="size-14 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{creator.symbol}</h1>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    creator.marketCapDelta24h >= 0
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : 'bg-[#ef4444]/10 text-[#ef4444]',
                  )}
                >
                  {creator.marketCapDelta24h >= 0 ? '+' : ''}
                  {creator.marketCapDelta24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {creator.creatorHandle ?? creator.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">
              ${lastValue.toFixed(lastValue >= 1 ? 4 : 8)}
            </div>
            <p className="text-xs text-muted-foreground">Token Price</p>
          </div>
        </div>
        <LivelineChart
          data={chartData}
          value={lastValue}
          height={380}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={barsLoading && chartData.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market Cap
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(creator.marketCap)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Volume
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(creator.volume24h)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Holders
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {creator.uniqueHolders.toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Change
          </p>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              creator.marketCapDelta24h >= 0
                ? 'text-[#22c55e]'
                : 'text-[#ef4444]',
            )}
          >
            {creator.marketCapDelta24h >= 0 ? '+' : ''}
            {formatCompact(creator.marketCapDelta24h)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Creator Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Contract</span>
            <a
              href={`https://basescan.org/address/${creator.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
              <svg
                className="size-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
          {creator.creatorHandle && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Creator</span>
              <span className="font-medium">@{creator.creatorHandle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MusicDetail({ id }: { id: string }) {
  const { data: songsData, isLoading, isError } = useTortoiseSongs()
  const song = songsData?.songs.find((s) => s.id === id)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex gap-4">
          <div className="size-24 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load song
      </div>
    )
  }

  if (!song) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Song not found
      </div>
    )
  }
  return <MusicDetailContent song={song} />
}

function MusicDetailContent({ song }: { song: Song }) {
  const { data: audio, isLoading } = useAudioDetail(song.url_slug)
  const coverUrl = song.image_ipfs_cid ? imageUrl(song.image_ipfs_cid) : null
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex gap-4">
        {coverUrl ? (
          <FadeImage
            src={coverUrl}
            alt=""
            wrapperClassName="size-24 shrink-0 rounded-lg"
            className="size-24 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium">{song.title}</h1>
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

function PerpDetail({ id }: { id: string }) {
  const { data: markets, isLoading, isError } = usePerpMarkets()
  const market = markets?.find((m) => m.id === id)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load perp market
      </div>
    )
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Perp market not found
      </div>
    )
  }
  return <PerpDetailContent market={market} />
}

function PerpDetailContent({ market }: { market: PerpMarketSnapshot }) {
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: candles, isLoading } = useHyperliquidCandles(
    market.coin,
    windowLabel,
  )

  const chartData = candles.length >= 2 ? candles : []

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const color = market.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FadeImage
              src={`https://app.hyperliquid.xyz/coins/${market.coin}.svg`}
              alt=""
              wrapperClassName="size-14 shrink-0 rounded-full"
              className="size-14 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{market.coin} PERP</h1>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    market.change24h >= 0
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : 'bg-[#ef4444]/10 text-[#ef4444]',
                  )}
                >
                  {market.change24h >= 0 ? '+' : ''}
                  {market.change24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Perpetual Futures</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">
              ${formatPerpPrice(market, market.markPx)}
            </div>
            <p className="text-xs text-muted-foreground">Mark Price</p>
          </div>
        </div>
        <LivelineChart
          data={chartData}
          value={market.markPx}
          height={380}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={isLoading && chartData.length === 0}
          emptyText="No chart data available"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Volume
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(market.volume24h)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Funding Rate
          </p>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              market.funding >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
            )}
          >
            {(market.funding * 100).toFixed(4)}%
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Open Interest
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(market.openInterest)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Change
          </p>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
            )}
          >
            {market.change24h >= 0 ? '+' : ''}
            {market.change24h.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Position Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-muted-foreground">Mark Price</span>
            <span className="font-semibold tabular-nums">
              ${formatPerpPrice(market, market.markPx)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-muted-foreground">Mid Price</span>
            <span className="font-semibold tabular-nums">
              ${formatPerpPrice(market, market.midPx)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-muted-foreground">Prev Day</span>
            <span className="font-semibold tabular-nums">
              ${formatPerpPrice(market, market.prevDayPx)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-muted-foreground">Max Leverage</span>
            <span className="font-semibold tabular-nums">
              {market.maxLeverage}x
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemesDetail({ id }: { id: string }) {
  const { data: meme, isLoading, isError } = useMemeTokenDetail(id)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Unable to load meme token
      </div>
    )
  }

  if (!meme) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        Meme token not found
      </div>
    )
  }

  return <MemeDetailContent meme={meme} />
}

function MemeDetailContent({ meme }: { meme: MemeToken }) {
  const primaryWebsite = meme.websites?.[0]
  const [windowLabel, setWindowLabel] = useState('15m')
  const { data: bars, isLoading } = useMemeOhlcv(meme.poolAddress, windowLabel)
  const chartData =
    bars.length >= 2
      ? bars
      : meme.priceHistory.length >= 2
        ? meme.priceHistory
        : [
            { time: Date.now() / 1000 - 3600, value: meme.price },
            { time: Date.now() / 1000, value: meme.price },
          ]

  const windowSecsRef = useRef(WINDOW_LABEL_TO_SECS[windowLabel])
  windowSecsRef.current = WINDOW_LABEL_TO_SECS[windowLabel]
  const handleWindowChange = useCallback((secs: number) => {
    if (secs === windowSecsRef.current) return
    windowSecsRef.current = secs
    const label = WINDOW_SECS_TO_LABEL[secs]
    if (label) setWindowLabel(label)
  }, [])

  const color = meme.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {meme.imageUrl && (
              <FadeImage
                src={meme.imageUrl}
                alt=""
                wrapperClassName="size-16 shrink-0 rounded-full"
                className="size-16 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold">{meme.symbol}</h1>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    meme.change24h >= 0
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : 'bg-[#ef4444]/10 text-[#ef4444]',
                  )}
                >
                  {meme.change24h >= 0 ? '+' : ''}
                  {meme.change24h.toFixed(2)}%
                </span>
              </div>
              <p className="truncate text-sm text-muted-foreground">{meme.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {meme.description?.trim() || 'No description available for this token yet.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl tabular-nums">${formatPrice(meme.price)}</div>
            <p className="text-xs text-muted-foreground">Current Price</p>
          </div>
        </div>

        {meme.launchProgress != null && (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Launch progress</span>
              <span className="font-semibold tabular-nums">
                {meme.launchProgress.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, meme.launchProgress))}%` }}
              />
            </div>
          </div>
        )}

        <LivelineChart
          data={chartData}
          value={meme.price}
          height={380}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
          isLoading={isLoading && bars.length === 0}
          emptyText="No chart data available"
          exaggerate
          formatValue={(v) => `$${formatPrice(v)}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            24h Volume
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(meme.volume24h)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Liquidity
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(meme.liquidity)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {meme.valuationLabel}
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCompact(meme.valuation)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Holders
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {meme.holdersCount?.toLocaleString('en-US') ?? '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Token Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Contract</span>
            <span className="font-mono text-xs">{meme.address}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Pool</span>
            <a
              href={`https://www.geckoterminal.com/solana/pools/${meme.poolAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-foreground underline underline-offset-2 hover:no-underline"
            >
              {meme.poolAddress}
            </a>
          </div>
          {meme.createdAt && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(meme.createdAt)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">GT Score</span>
            <span>{meme.gtScore ? meme.gtScore.toFixed(1) : '—'}</span>
          </div>
          {primaryWebsite && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Website</span>
              <a
                href={primaryWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-foreground underline underline-offset-2 hover:no-underline"
              >
                {primaryWebsite}
              </a>
            </div>
          )}
          {meme.twitterHandle && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">X</span>
              <a
                href={`https://x.com/${meme.twitterHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                @{meme.twitterHandle.replace(/^@/, '')}
              </a>
            </div>
          )}
          {meme.telegramHandle && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Telegram</span>
              <a
                href={`https://t.me/${meme.telegramHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                @{meme.telegramHandle.replace(/^@/, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

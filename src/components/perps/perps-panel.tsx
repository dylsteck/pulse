import { useState, useRef, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import {
  LivelineChart,
  WINDOW_LABEL_TO_SECS,
  WINDOW_SECS_TO_LABEL,
} from '@/components/trading/liveline-chart'
import { FadeImage } from '@/components/ui/fade-image'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/lib/format'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { formatPerpPrice } from '@/lib/hyperliquid/service'

function perpIconUrl(coin: string): string {
  return `https://app.hyperliquid.xyz/coins/${coin}.svg`
}

interface PerpsPanelProps {
  markets: PerpMarketSnapshot[]
  isLoading: boolean
  layout: 'list' | 'grid'
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
}

export function PerpsPanel({
  markets,
  isLoading,
  layout,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: PerpsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        Loading perps…
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center border-y border-border py-16 text-sm text-muted-foreground sm:rounded-xl sm:border-x">
        No perp markets found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {layout === 'list' ? (
        <PerpsTable
          markets={markets}
          selectedIndex={selectedIndex}
          expandedId={expandedId}
          rowRefs={rowRefs}
          onRowClick={onRowClick}
        />
      ) : (
        <PerpsGrid markets={markets} />
      )}
    </div>
  )
}

function PerpsTable({
  markets,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
}: {
  markets: PerpMarketSnapshot[]
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
}) {
  const gridCols = 'grid-cols-[1.1fr_1fr_0.8fr_0.9fr_0.8fr_0.8fr_32px]'
  return (
    <div className="w-full overflow-hidden border-y border-border sm:rounded-xl sm:border-x">
      <div
        className={cn(
          'sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6',
          gridCols,
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Perp
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mark
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h %
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          24h Vol
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Funding
        </span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          OI
        </span>
        <span />
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
              <div className="flex items-center gap-2">
                <FadeImage
                  src={perpIconUrl(market.coin)}
                  alt=""
                  wrapperClassName="size-7 shrink-0 rounded-full"
                  className="size-7 rounded-full object-cover"
                />
                <span className="text-sm font-semibold">{market.coin}</span>
                <span className="text-xs text-muted-foreground">PERP</span>
              </div>
              <span className="text-right text-sm tabular-nums">
                ${formatPerpPrice(market, market.markPx)}
              </span>
              <span
                className={cn(
                  'text-right text-sm tabular-nums',
                  market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                )}
              >
                {market.change24h >= 0 ? '+' : ''}
                {market.change24h.toFixed(2)}%
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {formatCompact(market.volume24h)}
              </span>
              <span
                className={cn(
                  'text-right text-xs tabular-nums',
                  market.funding >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                )}
              >
                {(market.funding * 100).toFixed(4)}%
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {formatCompact(market.openInterest)}
              </span>
              <span className="flex justify-end pr-1">
                <Link
                  to="/asset/$type/$id"
                  params={{ type: 'perps', id: market.id }}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="View details"
                  title="View details"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </span>
            </button>
            {expanded && (
              <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-6">
                <InlinePerpChart market={market} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InlinePerpChart({ market }: { market: PerpMarketSnapshot }) {
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
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{market.coin} PERP</span>
        <span className="text-lg font-semibold tabular-nums">
          ${formatPerpPrice(market, market.markPx)}
        </span>
      </div>
      {isLoading && chartData.length === 0 ? (
        <div className="h-[220px] w-full animate-pulse rounded-lg bg-muted" />
      ) : chartData.length >= 2 ? (
        <LivelineChart
          data={chartData}
          value={market.markPx}
          height={220}
          color={color}
          window={WINDOW_LABEL_TO_SECS[windowLabel]}
          onWindowChange={handleWindowChange}
        />
      ) : (
        <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
          No chart data available
        </div>
      )}
    </div>
  )
}

function PerpsGrid({ markets }: { markets: PerpMarketSnapshot[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {markets.map((market) => (
        <Link
          key={market.id}
          to="/asset/$type/$id"
          params={{ type: 'perps', id: market.id }}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40 sm:p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <FadeImage
                src={perpIconUrl(market.coin)}
                alt=""
                wrapperClassName="size-9 shrink-0 rounded-full"
                className="size-9 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold">{market.coin}</div>
                <div className="text-xs text-muted-foreground">PERP</div>
              </div>
            </div>
            <div
              className={cn(
                'text-xs font-medium tabular-nums',
                market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
              )}
            >
              {market.change24h >= 0 ? '+' : ''}
              {market.change24h.toFixed(2)}%
            </div>
          </div>
          <div className="mt-2 mb-1 text-lg font-semibold tabular-nums">
            ${formatPerpPrice(market, market.markPx)}
          </div>
          <div className="mt-auto pt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Volume</span>
            <span className="text-right tabular-nums">
              {formatCompact(market.volume24h)}
            </span>
            <span className="text-muted-foreground">Funding</span>
            <span className="text-right tabular-nums">
              {(market.funding * 100).toFixed(4)}%
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

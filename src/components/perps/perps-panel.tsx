import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { LivelineChart } from '@/components/trading/liveline-chart'
import { cn } from '@/lib/utils'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import { formatPerpPrice } from '@/lib/hyperliquid/service'

function formatCompact(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

interface PerpsPanelProps {
  markets: PerpMarketSnapshot[]
  isLoading: boolean
  layout: 'list' | 'grid'
  selectedIndex: number
  expandedId: string | null
  rowRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onRowClick: (index: number) => void
  onCardClick?: (id: string) => void
}

export function PerpsPanel({
  markets,
  isLoading,
  layout,
  selectedIndex,
  expandedId,
  rowRefs,
  onRowClick,
  onCardClick,
}: PerpsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
        Loading perps…
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border py-16 text-sm text-muted-foreground">
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
        <PerpsGrid
          markets={markets}
          expandedId={expandedId}
          onCardClick={onCardClick ?? (() => {})}
        />
      )}
    </div>
  )
}

function buildPerpSeries(market: PerpMarketSnapshot): Array<{ time: number; value: number }> {
  const now = Date.now()
  const points: Array<{ time: number; value: number }> = []
  const start = market.prevDayPx > 0 ? market.prevDayPx : market.markPx
  const end = market.markPx
  const span = Math.max(1, end - start)

  for (let i = 0; i < 30; i++) {
    const t = i / 29
    const curve = start + span * t
    const wobble = (Math.sin(i * 0.8) + Math.cos(i * 0.35)) * span * 0.08
    points.push({
      time: now - (29 - i) * 60_000,
      value: Math.max(0.00000001, curve + wobble),
    })
  }

  points[points.length - 1] = {
    time: now,
    value: end,
  }

  return points
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
    <div className="w-full overflow-hidden rounded-xl border border-border">
      <div className={cn('sticky top-0 z-10 grid gap-4 border-b border-border bg-muted/50 px-3 py-2 sm:px-6', gridCols)}>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Perp</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mark</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">24h %</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">24h Vol</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Funding</span>
        <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">OI</span>
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
                'grid w-full items-center gap-4 border-l-2 px-3 py-3 text-left transition-colors sm:px-6',
                gridCols,
                selected ? 'border-l-foreground bg-accent' : 'border-l-transparent hover:bg-accent/40',
              )}
              aria-selected={selected}
              aria-expanded={expanded}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold">{market.coin}</span>
                <span className="text-xs text-muted-foreground">PERP</span>
              </div>
              <span className="text-right font-mono text-sm tabular-nums">${formatPerpPrice(market, market.markPx)}</span>
              <span
                className={cn(
                  'text-right font-mono text-sm tabular-nums',
                  market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                )}
              >
                {market.change24h >= 0 ? '+' : ''}
                {market.change24h.toFixed(2)}%
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">{formatCompact(market.volume24h)}</span>
              <span className={cn('text-right font-mono text-xs tabular-nums', market.funding >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]')}>
                {(market.funding * 100).toFixed(4)}%
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">{formatCompact(market.openInterest)}</span>
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
  const history = useMemo(() => buildPerpSeries(market), [market])
  const color = market.change24h >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-sm font-semibold">{market.coin} PERP</span>
        <span className="font-mono text-lg font-semibold tabular-nums">
          ${formatPerpPrice(market, market.markPx)}
        </span>
      </div>
      <LivelineChart data={history} value={market.markPx} height={220} color={color} />
    </div>
  )
}

function PerpsGrid({
  markets,
  expandedId,
  onCardClick,
}: {
  markets: PerpMarketSnapshot[]
  expandedId: string | null
  onCardClick: (id: string) => void
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {markets.map((market) => {
        const expanded = expandedId === market.id
        return (
          <div key={market.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => onCardClick(market.id)}
              className={cn(
                'w-full p-3 text-left transition-colors sm:p-4',
                expanded && 'bg-accent/50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-mono text-sm font-semibold">{market.coin} PERP</div>
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
              </div>
              <div
                className={cn(
                  'mt-2 text-xs font-mono tabular-nums',
                  market.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]',
                )}
              >
                {market.change24h >= 0 ? '+' : ''}
                {market.change24h.toFixed(2)}%
              </div>
              <div className="mt-3 font-mono text-lg tabular-nums">${formatPerpPrice(market, market.markPx)}</div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-muted-foreground">Volume</span>
                <span className="text-right font-mono">{formatCompact(market.volume24h)}</span>
                <span className="text-muted-foreground">Funding</span>
                <span className="text-right font-mono">{(market.funding * 100).toFixed(4)}%</span>
              </div>
            </button>
            {expanded && (
              <div className="border-t border-border bg-muted/30 px-3 py-4 sm:px-4">
                <InlinePerpChart market={market} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

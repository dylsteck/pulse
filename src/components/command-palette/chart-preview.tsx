'use client'

import React from 'react'
import type { Market, Token } from '@/lib/types'
import type { CreatorToken } from '@/lib/zora/service'
import type { MemeToken } from '@/lib/geckoterminal'
import type { PerpMarketSnapshot } from '@/lib/hyperliquid/service'
import type { CommandSearchItem } from '@/hooks/use-command-search'
import { SparklineChart } from '@/components/trading/liveline-chart'
import { useTokenBars } from '@/hooks/use-token-bars'
import { useMemeOhlcv } from '@/hooks/use-meme-ohlcv'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useHyperliquidCandles } from '@/hooks/use-hyperliquid-candles'
import { useTokenPrice } from '@/hooks/use-token-price'

function TokenChartPreview({ token }: { token: Token }) {
  const { data: bars, isLoading } = useTokenBars(token.address, '1D')
  const { price } = useTokenPrice(token)
  const chartData = bars.length >= 2 ? bars : token.priceHistory
  const color = token.change24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || chartData.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={chartData}
        value={price}
        color={color}
        height={80}
      />
    </div>
  )
}

function CreatorChartPreview({ creator }: { creator: CreatorToken }) {
  const { data: bars, isLoading } = useTokenBars(creator.address, '1D')
  const chartData = bars.length >= 2 ? bars : creator.sparkline
  const value = creator.sparkline[creator.sparkline.length - 1]?.value ?? 0
  const color = creator.marketCapDelta24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || chartData.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={chartData}
        value={value}
        color={color}
        height={80}
      />
    </div>
  )
}

function MemeChartPreview({ meme }: { meme: MemeToken }) {
  const { data: bars, isLoading } = useMemeOhlcv(meme.poolAddress, '1D')
  const chartData =
    bars.length >= 2
      ? bars
      : meme.priceHistory.length >= 2
        ? meme.priceHistory
        : []
  const color = meme.change24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || chartData.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={chartData}
        value={meme.price}
        color={color}
        height={80}
      />
    </div>
  )
}

function MarketChartPreview({ market }: { market: Market }) {
  const clobTokenId = market.clobTokenId
  if (!clobTokenId) return null
  const { data: history, isLoading } = useMarketHistory(clobTokenId, '1D')
  const color = '#3b82f6'
  if (isLoading || !history || history.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={history}
        value={market.yesPercent}
        color={color}
        height={80}
      />
    </div>
  )
}

function PerpChartPreview({ perp }: { perp: PerpMarketSnapshot }) {
  const { data: candles, isLoading } = useHyperliquidCandles(perp.coin, '1D')
  const color = perp.change24h >= 0 ? '#22c55e' : '#ef4444'
  if (isLoading || !candles || candles.length < 2) return null
  return (
    <div className="h-24 w-full">
      <SparklineChart
        data={candles}
        value={perp.markPx}
        color={color}
        height={80}
      />
    </div>
  )
}

export function ChartPreview({ item }: { item: CommandSearchItem }) {
  if (!item.hasChart) return null
  const raw = item.raw
  let chart: React.ReactNode = null
  switch (item.type) {
    case 'tokens':
      chart = <TokenChartPreview token={raw as Token} />
      break
    case 'creators':
      chart = <CreatorChartPreview creator={raw as CreatorToken} />
      break
    case 'memes':
      chart = <MemeChartPreview meme={raw as MemeToken} />
      break
    case 'markets':
      chart = <MarketChartPreview market={raw as Market} />
      break
    case 'perps':
      chart = <PerpChartPreview perp={raw as PerpMarketSnapshot} />
      break
  }
  if (!chart) return null
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-popover/95 backdrop-blur-sm">
      {chart}
    </div>
  )
}

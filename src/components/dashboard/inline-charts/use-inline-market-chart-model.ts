import { useMemo } from 'react'
import type { Market } from '@/lib/types'
import { useMarketBatchHistory } from '@/hooks/use-market-batch-history'
import { useMarketOdds } from '@/hooks/use-market-odds'
import { useMarketHistory } from '@/hooks/use-market-history'
import { useWindowChange } from '@/hooks/use-window-change'
import {
  POLYMARKET_MULTI_OUTCOME_COLORS,
  POLYMARKET_NO_COLOR,
  POLYMARKET_YES_COLOR,
  buildPolymarketLivelineSeries,
} from '@/lib/polymarket-liveline-series'
import { WINDOW_LABEL_TO_SECS } from '@/components/trading/liveline-chart'

const INLINE_MULTI_CAP = 20

/* eslint-disable max-lines-per-function -- batch + binary/multi series builders */
export function useInlineMarketChartModel(market: Market) {
  const { yesPercent, noPercent } = useMarketOdds(market)
  const { windowLabel, handleWindowChange } = useWindowChange()
  const windowSecs = WINDOW_LABEL_TO_SECS[windowLabel]

  const isMultiOutcome = Boolean(market.outcomes && market.outcomes.length > 0)
  const useBinaryDual =
    !isMultiOutcome &&
    Boolean(market.clobTokenId && market.noClobTokenId)

  const outcomesWithTokens = useMemo(() => {
    if (!market.outcomes) return []
    return market.outcomes
      .filter((o) => o.clobTokenId)
      .slice(0, INLINE_MULTI_CAP)
  }, [market.outcomes])

  const multiTokenIds = useMemo(
    () =>
      outcomesWithTokens
        .map((o) => o.clobTokenId)
        .filter((id): id is string => Boolean(id)),
    [outcomesWithTokens],
  )

  const batchTokenIds = useMemo(() => {
    if (isMultiOutcome) return multiTokenIds
    if (useBinaryDual && market.clobTokenId && market.noClobTokenId) {
      return [market.clobTokenId, market.noClobTokenId]
    }
    return []
  }, [
    isMultiOutcome,
    useBinaryDual,
    market.clobTokenId,
    market.noClobTokenId,
    multiTokenIds,
  ])

  const { data: batchHistories, isLoading: batchLoading } =
    useMarketBatchHistory(batchTokenIds, windowLabel)

  const { data: singleHistory, isLoading: singleLoading } = useMarketHistory(
    useBinaryDual || isMultiOutcome ? undefined : market.clobTokenId,
    windowLabel,
  )

  const binaryDualSeries = useMemo(() => {
    if (!useBinaryDual || !market.clobTokenId || !market.noClobTokenId) {
      return []
    }
    return buildPolymarketLivelineSeries(
      batchHistories,
      [
        {
          id: 'yes',
          label: 'Yes',
          color: POLYMARKET_YES_COLOR,
          tokenId: market.clobTokenId,
          currentPercent: yesPercent,
        },
        {
          id: 'no',
          label: 'No',
          color: POLYMARKET_NO_COLOR,
          tokenId: market.noClobTokenId,
          currentPercent: noPercent,
        },
      ],
      windowSecs,
    )
  }, [
    useBinaryDual,
    batchHistories,
    market.clobTokenId,
    market.noClobTokenId,
    yesPercent,
    noPercent,
    windowSecs,
  ])

  const multiSeries = useMemo(() => {
    if (!isMultiOutcome || outcomesWithTokens.length === 0) return []
    return buildPolymarketLivelineSeries(
      batchHistories,
      outcomesWithTokens.map((o, i) => ({
        id: `inline-${i}-${o.name}`,
        label: o.name,
        color:
          POLYMARKET_MULTI_OUTCOME_COLORS[
            i % POLYMARKET_MULTI_OUTCOME_COLORS.length
          ],
        tokenId: o.clobTokenId!,
        currentPercent: o.percent,
      })),
      windowSecs,
    )
  }, [isMultiOutcome, outcomesWithTokens, batchHistories, windowSecs])

  const chartData =
    singleHistory.length >= 2
      ? singleHistory
      : [
          { time: Date.now() / 1000 - 60, value: yesPercent },
          { time: Date.now() / 1000, value: yesPercent },
        ]

  const showBinaryMulti = useBinaryDual && binaryDualSeries.length >= 1
  const showMultiOutcomeChart = isMultiOutcome && multiSeries.length > 0

  return {
    yesPercent,
    windowSecs,
    handleWindowChange,
    batchHistories,
    batchLoading,
    singleHistory,
    singleLoading,
    chartData,
    binaryDualSeries,
    multiSeries,
    showBinaryMulti,
    showMultiOutcomeChart,
    isMultiOutcome,
    outcomesLeading: market.outcomes?.[0],
  }
}

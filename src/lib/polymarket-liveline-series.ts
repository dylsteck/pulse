import type { LivelineSeries } from 'liveline'
import {
  buildSparseChartSeries,
  extendToFullWindow,
} from '@/lib/chart-point-utils'

/** Binary Yes/No — matches market-detail buttons. */
export const POLYMARKET_YES_COLOR = '#22c55e'
export const POLYMARKET_NO_COLOR = '#ef4444'

/** Distinct colors for multi-outcome lines (Liveline doc-style palette). */
export const POLYMARKET_MULTI_OUTCOME_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
] as const

export type PolymarketSeriesSpec = {
  /** Stable id for Liveline (e.g. `yes`, `no`, or slug from outcome name). */
  id: string
  label: string
  color: string
  tokenId: string
  currentPercent: number
}

/**
 * Build Liveline `series` from batch history map + outcome specs.
 * Applies the same sparse + window extension as single-series charts.
 */
export function buildPolymarketLivelineSeries(
  histories: Record<string, Array<{ time: number; value: number }>>,
  specs: Array<PolymarketSeriesSpec>,
  windowSecs: number,
): Array<LivelineSeries> {
  return specs.map((spec) => {
    const raw = histories[spec.tokenId] ?? []
    let points = buildSparseChartSeries(raw, spec.currentPercent)
    if (points.length >= 2 && windowSecs > 0) {
      points = extendToFullWindow(points, windowSecs, spec.currentPercent)
    }
    return {
      id: spec.id,
      label: spec.label,
      color: spec.color,
      data: points,
      value: spec.currentPercent,
    }
  })
}

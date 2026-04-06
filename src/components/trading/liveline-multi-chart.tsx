import { useEffect, useMemo, useState } from 'react'
import { Liveline } from 'liveline'
import type { LivelineSeries } from 'liveline'
import { useTheme } from '@/components/theme-provider'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { TimeframeSegmentedControl } from '@/components/trading/timeframe-segmented-control'
import { TIME_WINDOWS } from '@/components/trading/liveline-chart'
import { cn } from '@/lib/utils'

const LIVELINE_PADDING_DESKTOP = { top: 12, right: 56, bottom: 40, left: 12 } as const
const LIVELINE_PADDING_MOBILE = { top: 10, right: 52, bottom: 36, left: 8 } as const
const LIVELINE_PADDING = LIVELINE_PADDING_DESKTOP
const FULL_SIZE_STYLE = { width: '100%', height: '100%' } as const
const CHART_TOOLBAR_GAP_PX = 6

export interface LivelineMultiChartProps {
  series: Array<LivelineSeries>
  height?: number
  formatValue?: (v: number) => string
  onWindowChange?: (secs: number) => void
  window?: number
  isLoading?: boolean
  emptyText?: string
  alignToolbarWithPage?: boolean
  /** Compact legend chips on small screens (Liveline `seriesToggleCompact`). */
  seriesToggleCompact?: boolean
}

/**
 * Polymarket-style multi-outcome chart. Uses Liveline `series`; top-level `data`/`value`
 * are still required by types — the canvas uses `multiSeries` when `series.length > 0`
 * (badge/fill/momentum off in the library).
 */
/* eslint-disable max-lines-per-function -- toolbar + Liveline multi-series wiring */
export function LivelineMultiChart({
  series,
  height = 260,
  formatValue,
  onWindowChange,
  window: windowProp,
  isLoading = false,
  emptyText,
  alignToolbarWithPage = false,
  seriesToggleCompact,
}: LivelineMultiChartProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()
  const livelinePadding = isMobile ? LIVELINE_PADDING_MOBILE : LIVELINE_PADDING
  const compact =
    seriesToggleCompact !== undefined ? seriesToggleCompact : isMobile

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  const resolvedWindow = useMemo(() => {
    if (typeof windowProp === 'number') return windowProp
    const span =
      series.length > 0 && series[0].data.length >= 2
        ? Math.abs(
            series[0].data[series[0].data.length - 1].time -
              series[0].data[0].time,
          )
        : 3600
    const spanSecs = span > 1e6 ? span / 1000 : span
    return (
      TIME_WINDOWS.find((w) => w.secs >= spanSecs)?.secs ??
      TIME_WINDOWS[TIME_WINDOWS.length - 1].secs
    )
  }, [windowProp, series])

  const placeholder = useMemo(() => {
    if (series.length > 0 && series[0].data.length >= 2) {
      const first = series[0]
      return { data: first.data, value: first.value }
    }
    const t = Date.now() / 1000
    return {
      data: [
        { time: t - 3600, value: 0 },
        { time: t, value: 0 },
      ],
      value: 0,
    }
  }, [series])

  /** Parent should set `isLoading` false once upstream has returned (even if empty). */
  const showLoadingOverlay = isLoading

  const showWindowControls = Boolean(onWindowChange)
  const toolbarH = showWindowControls ? 28 : 0
  const outerHeightPx =
    Math.max(120, height) +
    toolbarH +
    (showWindowControls ? CHART_TOOLBAR_GAP_PX : 0)

  return (
    <div
      className="flex min-h-0 w-full flex-col gap-1.5 overflow-visible"
      style={{ height: `${outerHeightPx}px` }}
    >
      {showWindowControls && (
        <div
          className={cn(
            'flex min-h-[28px] shrink-0 flex-wrap items-center',
            alignToolbarWithPage && 'px-3 sm:px-6',
          )}
          style={
            alignToolbarWithPage
              ? undefined
              : { paddingLeft: livelinePadding.left }
          }
        >
          <TimeframeSegmentedControl
            windows={TIME_WINDOWS}
            value={resolvedWindow}
            onChange={(secs) => onWindowChange?.(secs)}
            isDark={isDark}
          />
        </div>
      )}
      <div className="relative min-h-0 w-full flex-1 overflow-visible">
        {mounted && series.length > 0 && (
          <div
            className={cn(
              'absolute inset-0',
              series.length > 1 && 'liveline-multi-chart-shell',
            )}
          >
            <Liveline
              data={placeholder.data}
              value={placeholder.value}
              series={series}
              theme={isDark ? 'dark' : 'light'}
              window={resolvedWindow}
              windowStyle="rounded"
              grid
              badge={false}
              momentum={false}
              fill={false}
              scrub
              padding={livelinePadding}
              loading={showLoadingOverlay}
              seriesToggleCompact={compact}
              {...(emptyText ? { emptyText } : {})}
              {...(formatValue ? { formatValue } : {})}
              style={FULL_SIZE_STYLE}
            />
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Liveline } from 'liveline'
import { useTheme } from '@/components/theme-provider'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { TimeframeSegmentedControl } from '@/components/trading/timeframe-segmented-control'
import {
  buildSparseChartSeries,
  extendToFullWindow,
} from '@/lib/chart-point-utils'
import { cn } from '@/lib/utils'

export const TIME_WINDOWS = [
  { label: '15m', secs: 900 },
  { label: '1h', secs: 3600 },
  { label: '6h', secs: 21600 },
  { label: '1d', secs: 86400 },
]

export const WINDOW_SECS_TO_LABEL: Record<number, string> = Object.fromEntries(
  TIME_WINDOWS.map((w) => [w.secs, w.label]),
)

export const WINDOW_LABEL_TO_SECS: Record<string, number> = Object.fromEntries(
  TIME_WINDOWS.map((w) => [w.label, w.secs]),
)

/** Slightly tighter right gutter on desktop so the series uses more width (badge still fits). */
const LIVELINE_PADDING_DESKTOP = { top: 12, right: 56, bottom: 40, left: 12 } as const
/** Tighter sides on narrow screens so more width is used for the series + badge. */
const LIVELINE_PADDING_MOBILE = { top: 10, right: 52, bottom: 36, left: 8 } as const
/** Alias for desktop padding — keeps `LIVELINE_PADDING` defined for HMR / any stale refs. */
const LIVELINE_PADDING = LIVELINE_PADDING_DESKTOP
const SPARKLINE_PADDING = { top: 2, right: 2, bottom: 2, left: 2 } as const
const FULL_SIZE_STYLE = { width: '100%', height: '100%' } as const
/** gap-1.5 between toolbar and chart */
const CHART_TOOLBAR_GAP_PX = 6

interface LivelineChartProps {
  data: Array<{ time: number; value: number }>
  value: number
  height?: number
  color?: string
  formatValue?: (v: number) => string
  onWindowChange?: (secs: number) => void
  window?: number
  /** Show Liveline's built-in loading state (breathing animation) */
  isLoading?: boolean
  /** Freeze chart scrolling; resume catches up to real time */
  paused?: boolean
  /** Custom text for empty state (default: "No data to display") */
  emptyText?: string
  /** Tight Y-axis — small moves fill chart height (for tiny values like meme tokens) */
  exaggerate?: boolean
  /** Match asset page horizontal padding so timeframe buttons line up with the price row (use inside AssetDetailChartBleed). */
  alignToolbarWithPage?: boolean
}

export function LivelineChart({
  data,
  value,
  height = 260,
  color,
  formatValue,
  onWindowChange,
  window: windowProp,
  isLoading = false,
  paused = false,
  emptyText,
  exaggerate = false,
  alignToolbarWithPage = false,
}: LivelineChartProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()
  const livelinePadding = isMobile ? LIVELINE_PADDING_MOBILE : LIVELINE_PADDING

  useEffect(() => {
    setMounted(true)
  }, [])

  let chartData = buildSparseChartSeries(data, value)
  /** Do not cover the chart with Liveline's loading state when sparse data + spot
   *  price already produce a drawable series (see buildSparseChartSeries). */
  const showLoadingOverlay = isLoading && chartData.length < 2
  const dataSpanSecs =
    chartData.length >= 2
      ? Math.abs(chartData[chartData.length - 1].time - chartData[0].time)
      : 3600
  const spanSecs = dataSpanSecs > 1e6 ? dataSpanSecs / 1000 : dataSpanSecs
  const defaultWindow =
    TIME_WINDOWS.find((w) => w.secs >= spanSecs)?.secs ??
    TIME_WINDOWS[TIME_WINDOWS.length - 1].secs

  const resolvedWindow = windowProp ?? defaultWindow
  if (chartData.length >= 2 && resolvedWindow) {
    chartData = extendToFullWindow(chartData, resolvedWindow, value)
  }

  const resolvedColor = color ?? (isDark ? '#3b82f6' : '#111111')

  /** Liveline ignores the `window` prop for its tab bar when `windows` is set — it always
   *  initializes from `windows[0]` (15m). We render timeframe controls here instead. */
  const showWindowControls = Boolean(onWindowChange)
  const toolbarH = showWindowControls ? 28 : 0
  /** Fixed total height so flex parents cannot stretch this block and leave dead space below. */
  const outerHeightPx =
    Math.max(120, height) +
    toolbarH +
    (showWindowControls ? CHART_TOOLBAR_GAP_PX : 0)

  return (
    <div
      className="flex min-h-0 w-full flex-col gap-1.5 overflow-visible"
      style={{
        height: `${outerHeightPx}px`,
      }}
    >
      {showWindowControls && (
        <div
          className={cn(
            'flex min-h-[28px] shrink-0 flex-wrap items-center',
            alignToolbarWithPage && 'px-3 sm:px-6',
          )}
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
        {mounted && (
          <div className="absolute inset-0">
            <Liveline
              data={chartData}
              value={value}
              color={resolvedColor}
              theme={isDark ? 'dark' : 'light'}
              window={resolvedWindow}
              badge
              momentum
              fill
              grid
              padding={livelinePadding}
              loading={showLoadingOverlay}
              paused={paused}
              exaggerate={exaggerate}
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

export function SparklineChart({
  data,
  value,
  color,
  height = 40,
}: {
  data: Array<{ time: number; value: number }>
  value: number
  color?: string
  height?: number
}) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const series = buildSparseChartSeries(data, value)
  if (series.length < 2 || !mounted) return null

  const resolvedColor = color ?? (isDark ? '#3b82f6' : '#111111')

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Liveline
        data={series}
        value={value}
        color={resolvedColor}
        theme={isDark ? 'dark' : 'light'}
        badge={false}
        grid={false}
        scrub={false}
        pulse={false}
        fill
        momentum={false}
        padding={SPARKLINE_PADDING}
        style={FULL_SIZE_STYLE}
      />
    </div>
  )
}

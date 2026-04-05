import { useEffect, useState } from 'react'
import { Liveline } from 'liveline'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export const TIME_WINDOWS = [
  { label: '15m', secs: 900 },
  { label: '1H', secs: 3600 },
  { label: '6H', secs: 21600 },
  { label: '1D', secs: 86400 },
]

export const WINDOW_SECS_TO_LABEL: Record<number, string> = Object.fromEntries(
  TIME_WINDOWS.map((w) => [w.secs, w.label]),
)

export const WINDOW_LABEL_TO_SECS: Record<string, number> = Object.fromEntries(
  TIME_WINDOWS.map((w) => [w.label, w.secs]),
)

const LIVELINE_PADDING = { top: 12, right: 80, bottom: 40, left: 12 } as const
const SPARKLINE_PADDING = { top: 2, right: 2, bottom: 2, left: 2 } as const
const FULL_SIZE_STYLE = { width: '100%', height: '100%' } as const
/** gap-1.5 between toolbar and chart */
const CHART_TOOLBAR_GAP_PX = 6

function ensureMinChartData(
  data: Array<{ time: number; value: number }>,
  currentValue: number,
): Array<{ time: number; value: number }> {
  if (data.length >= 2) return data
  if (data.length === 0) {
    const t = Date.now() / 1000
    const isSeconds = t < 1e10
    const oneHour = isSeconds ? 3600 : 3600_000
    return [
      { time: t - oneHour, value: currentValue },
      { time: t, value: currentValue },
    ]
  }
  const last = data[0]
  const val = last.value
  const t = last.time
  const isSeconds = t < 1e10
  const oneHour = isSeconds ? 3600 : 3600_000
  return [
    { time: t - oneHour, value: val },
    { time: t, value: currentValue },
  ]
}

/** At least two points for Liveline/Sparkline when APIs return sparse or empty series. */
function buildSparseChartSeries(
  raw: Array<{ time: number; value: number }>,
  currentValue: number,
): Array<{ time: number; value: number }> {
  if (raw.length >= 2) return ensureMinChartData(raw, currentValue)
  if (raw.length === 1) return ensureMinChartData(raw, currentValue)
  if (Number.isFinite(currentValue)) return ensureMinChartData([], currentValue)
  return []
}

/** Normalize timestamp to seconds (APIs may return ms).
 *  Heuristic: values above 1e12 (~year 2001 in ms) are treated as milliseconds. */
function toSeconds(t: number): number {
  return t > 1e12 ? t / 1000 : t
}

/** Extend data so the line stretches across the full visible window */
function extendToFullWindow(
  data: Array<{ time: number; value: number }>,
  windowSecs: number,
  currentValue: number,
): Array<{ time: number; value: number }> {
  if (data.length < 2) return data
  const now = Date.now() / 1000
  const windowStart = now - windowSecs

  const normalized = data
    .map((p) => ({ time: toSeconds(p.time), value: p.value }))
    .sort((a, b) => a.time - b.time)

  const first = normalized[0]
  const last = normalized[normalized.length - 1]
  let result = normalized

  if (first.time > windowStart) {
    result = [{ time: windowStart, value: first.value }, ...result]
  }
  if (last.time < now) {
    result = [...result, { time: now, value: currentValue }]
  }
  return result
}

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
}: LivelineChartProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
  const toolbarH = showWindowControls ? 26 : 0
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
        <div className="flex h-[26px] shrink-0 flex-wrap items-center gap-1">
          {TIME_WINDOWS.map((w) => {
            const active = w.secs === resolvedWindow
            return (
              <button
                key={w.label}
                type="button"
                onClick={() => onWindowChange?.(w.secs)}
                className={cn(
                  'rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/80',
                )}
              >
                {w.label}
              </button>
            )
          })}
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
              padding={LIVELINE_PADDING}
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

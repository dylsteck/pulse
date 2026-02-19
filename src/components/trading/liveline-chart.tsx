import { useState, useEffect } from 'react'
import { Liveline } from 'liveline'
import { useTheme } from '@/components/theme-provider'

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

interface LivelineChartProps {
  data: { time: number; value: number }[]
  value: number
  height?: number
  color?: string
  formatValue?: (v: number) => string
  onWindowChange?: (secs: number) => void
  window?: number
}

export function LivelineChart({
  data,
  value,
  height = 260,
  color,
  formatValue,
  onWindowChange,
  window: windowProp,
}: LivelineChartProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const dataSpanSecs =
    data.length >= 2
      ? Math.abs(data[data.length - 1]!.time - data[0]!.time)
      : 3600
  const spanSecs = dataSpanSecs > 1e9 ? dataSpanSecs / 1000 : dataSpanSecs
  const defaultWindow =
    TIME_WINDOWS.find((w) => w.secs >= spanSecs)?.secs ??
    TIME_WINDOWS[TIME_WINDOWS.length - 1]!.secs

  const resolvedColor = color ?? (isDark ? '#3b82f6' : '#111111')

  return (
    <div
      className="min-h-0 overflow-visible"
      style={{ width: '100%', height: `${height}px`, minHeight: `${height}px` }}
    >
      {mounted && (
        <Liveline
          data={data}
          value={value}
          color={resolvedColor}
          theme={isDark ? 'dark' : 'light'}
          window={windowProp ?? defaultWindow}
          windows={TIME_WINDOWS}
          onWindowChange={onWindowChange}
          windowStyle="text"
          badge
          momentum
          fill
          grid
          padding={{ top: 12, right: 80, bottom: 40, left: 12 }}
          {...(formatValue ? { formatValue } : {})}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}

export function SparklineChart({
  data,
  value,
  color,
  height = 40,
}: {
  data: { time: number; value: number }[]
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

  if (data.length < 2 || !mounted) return null

  const resolvedColor = color ?? (isDark ? '#3b82f6' : '#111111')

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Liveline
        data={data}
        value={value}
        color={resolvedColor}
        theme={isDark ? 'dark' : 'light'}
        badge={false}
        grid={false}
        scrub={false}
        pulse={false}
        fill
        momentum={false}
        padding={{ top: 2, right: 2, bottom: 2, left: 2 }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

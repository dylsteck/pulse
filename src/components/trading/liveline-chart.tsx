import { useState, useEffect } from 'react'
import { Liveline } from 'liveline'
import { useTheme } from '@/components/theme-provider'

const TIME_WINDOWS = [
  { label: '15m', secs: 900 },
  { label: '1H', secs: 3600 },
  { label: '6H', secs: 21600 },
  { label: '1D', secs: 86400 },
]

interface LivelineChartProps {
  data: { time: number; value: number }[]
  value: number
  height?: number
  formatValue?: (v: number) => string
}

export function LivelineChart({ data, value, height = 260, formatValue }: LivelineChartProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="min-h-0 overflow-visible"
      style={{ width: '100%', height: `${height}px`, minHeight: `${height}px` }}
    >
      {mounted && (
        <Liveline
          data={data}
          value={value}
          color={isDark ? '#3b82f6' : '#111111'}
          theme={isDark ? 'dark' : 'light'}
          window={3600}
          windows={TIME_WINDOWS}
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

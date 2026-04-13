import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type TimeframeWindow = { label: string; secs: number }

export function TimeframeSegmentedControl({
  windows,
  value,
  onChange,
  isDark,
  className,
}: {
  windows: Array<TimeframeWindow>
  value: number
  onChange: (secs: number) => void
  isDark: boolean
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    const track = trackRef.current
    const idx = windows.findIndex((w) => w.secs === value)
    const btn = buttonRefs.current[idx]
    if (!track || !btn) return
    const tr = track.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setIndicator({
      left: br.left - tr.left,
      width: br.width,
    })
  }, [value, windows])

  useLayoutEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  useEffect(() => {
    const onResize = () => updateIndicator()
    window.addEventListener('resize', onResize)
    const track = trackRef.current
    const ro = track ? new ResizeObserver(() => updateIndicator()) : null
    if (track && ro) ro.observe(track)
    return () => {
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
    }
  }, [updateIndicator])

  return (
    <div className={cn('flex items-center', className)}>
      <div
        ref={trackRef}
        className={cn(
          'relative inline-flex gap-0 rounded-full p-[3px]',
          isDark ? 'bg-white/[0.04]' : 'bg-black/[0.02]',
        )}
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-[3px] rounded-full transition-[left,width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            'h-[calc(100%-6px)]',
            isDark ? 'bg-white/[0.08]' : 'bg-black/[0.035]',
            indicator.width <= 0 && 'opacity-0',
          )}
          style={
            indicator.width > 0
              ? { left: indicator.left, width: indicator.width }
              : undefined
          }
        />
        {windows.map((w, i) => {
          const active = w.secs === value
          return (
            <button
              key={w.label}
              ref={(el) => {
                buttonRefs.current[i] = el
              }}
              type="button"
              onClick={() => onChange(w.secs)}
              className={cn(
                'relative z-[1] cursor-pointer rounded-full border-none px-2 py-[3px] text-[11px] leading-4 transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active
                  ? isDark
                    ? 'font-semibold text-foreground'
                    : 'font-semibold text-[rgba(0,0,0,0.55)]'
                  : isDark
                    ? 'font-normal text-white/40 hover:text-white/55'
                    : 'font-normal text-[rgba(0,0,0,0.22)] hover:text-[rgba(0,0,0,0.4)]',
              )}
            >
              {w.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

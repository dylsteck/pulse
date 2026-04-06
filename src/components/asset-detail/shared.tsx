import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Flat label + value stat for detail page grids */
export function StatItem({
  label,
  value,
  className,
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums', className)}>
        {value}
      </p>
    </div>
  )
}

/** Section heading + content wrapper for detail pages */
export function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  )
}

/** Key/value row inside a DetailSection */
export function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

/** Green/red percentage change display — pill variant for detail headers, plain for cards */
export function ChangeBadge({
  value,
  pill = false,
}: {
  value: number
  pill?: boolean
}) {
  const isPositive = value >= 0
  const text = `${isPositive ? '+' : ''}${value.toFixed(2)}%`

  if (pill) {
    return (
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-sm font-medium tracking-wide',
          isPositive
            ? 'bg-[#22c55e]/10 text-[#22c55e]'
            : 'bg-[#ef4444]/10 text-[#ef4444]',
        )}
      >
        {text}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]',
      )}
    >
      {text}
    </span>
  )
}

/** Error / not-found / empty message for detail pages */
export function DetailMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

/** Stats row under the chart — same horizontal inset as DetailSection (page padding only). */
export function AssetDetailStatsGrid({
  children,
  className,
  cols = 4,
}: {
  children: ReactNode
  className?: string
  cols?: 3 | 4
}) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 justify-items-start gap-x-6 gap-y-4 text-left',
        cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Extends the chart into the right padding only; left edge stays aligned with padded content (Token Details, stats). */
export function AssetDetailChartBleed({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'min-w-0 -mr-3 w-[calc(100%+0.75rem)] sm:-mr-6 sm:w-[calc(100%+1.5rem)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

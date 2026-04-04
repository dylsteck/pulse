import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TradingDrawerEmptyState({
  icon,
  children,
  actions,
  className,
}: {
  icon: ReactNode
  children: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-1 py-5 text-center',
        className,
      )}
    >
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <div className="max-w-[240px] text-sm">{children}</div>
      {actions ? (
        <div className="flex flex-col items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

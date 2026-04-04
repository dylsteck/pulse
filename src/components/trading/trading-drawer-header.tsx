import { ChevronDownIcon, XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TradingDrawerHeaderProps {
  titleId: string
  title: string
  subtitle?: string
  icon: ReactNode
  finishClose: () => void
  showCollapse: boolean
  collapsed: boolean
  onToggleCollapse?: () => void
}

export function TradingDrawerHeader({
  titleId,
  title,
  subtitle,
  icon,
  finishClose,
  showCollapse,
  collapsed,
  onToggleCollapse,
}: TradingDrawerHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <h2
            id={titleId}
            className="truncate text-sm font-semibold leading-tight"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {showCollapse && onToggleCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand panel' : 'Minimize panel'}
          >
            <ChevronDownIcon
              className={cn(
                'size-4 transition-transform duration-200',
                collapsed ? '-rotate-180' : '',
              )}
            />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8"
          onClick={finishClose}
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}

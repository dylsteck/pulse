import type { ReactNode } from 'react'
import { TradingDrawerHeader } from '@/components/trading/trading-drawer-header'
import { cn } from '@/lib/utils'

function TradingDrawerFrame({
  frameContent,
  children,
}: {
  frameContent: boolean
  children: ReactNode
}) {
  if (frameContent) {
    return (
      <div className="p-3 pt-2">
        <div className="rounded-[1.35rem] border border-border bg-muted/30 p-1">
          <div className="rounded-xl bg-background px-3 pb-4 pt-3">{children}</div>
        </div>
      </div>
    )
  }
  return <div className="p-3 pt-2">{children}</div>
}

export interface TradingDrawerPanelProps {
  exiting: boolean
  panelVisible: boolean
  titleId: string
  title: string
  subtitle?: string
  icon: ReactNode
  finishClose: () => void
  showCollapse: boolean
  collapsed: boolean
  onToggleCollapse?: () => void
  frameContent: boolean
  children: ReactNode
}

export function TradingDrawerPanel({
  exiting,
  panelVisible,
  titleId,
  title,
  subtitle,
  icon,
  finishClose,
  showCollapse,
  collapsed,
  onToggleCollapse,
  frameContent,
  children,
}: TradingDrawerPanelProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        'pointer-events-auto fixed z-[51] flex max-h-[min(85vh,720px)] w-auto flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-foreground/5',
        'will-change-transform',
        'transition-[transform,opacity] motion-reduce:duration-0',
        exiting
          ? 'duration-[280ms] ease-[cubic-bezier(0.4,0,1,1)]'
          : 'duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'bottom-3 right-3 left-3 sm:bottom-5 sm:right-5 sm:left-auto',
        'sm:w-[min(100vw-2rem,380px)]',
        panelVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0',
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <TradingDrawerHeader
        titleId={titleId}
        title={title}
        subtitle={subtitle}
        icon={icon}
        finishClose={finishClose}
        showCollapse={showCollapse}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />

      {!collapsed ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TradingDrawerFrame frameContent={frameContent}>
            {children}
          </TradingDrawerFrame>
        </div>
      ) : null}
    </div>
  )
}

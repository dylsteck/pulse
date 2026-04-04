import type { ReactNode } from 'react'
import { TradingDrawerHeader } from '@/components/trading/trading-drawer-header'

function TradingDrawerFrame({
  frameContent,
  children,
}: {
  frameContent: boolean
  children: ReactNode
}) {
  if (frameContent) {
    return (
      <div className="px-3 pb-3 pt-2">
        <div className="rounded-xl bg-muted/15 px-3 pb-4 pt-3">{children}</div>
      </div>
    )
  }
  return <div className="px-3 pb-3 pt-2">{children}</div>
}

export interface TradingDrawerPanelProps {
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

/** Inner layout for the trading drawer; outer positioning lives on Dialog Popup. */
export function TradingDrawerPanel({
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
    <>
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
    </>
  )
}

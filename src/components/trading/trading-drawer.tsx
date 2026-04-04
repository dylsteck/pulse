import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TradingDrawerPanel } from '@/components/trading/trading-drawer-panel'

export interface TradingDrawerProps {
  title: string
  subtitle?: string
  titleId: string
  icon: ReactNode
  onClose: () => void
  children: ReactNode
  showCollapse?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  frameContent?: boolean
}

/**
 * Bottom-right docked panel for trading flows (swap, Polymarket trade, etc.).
 * Use with `createPortal(..., document.body)` from the caller.
 */
export function TradingDrawer({
  title,
  subtitle,
  titleId,
  icon,
  onClose,
  children,
  showCollapse = true,
  collapsed = false,
  onToggleCollapse,
  frameContent = true,
}: TradingDrawerProps) {
  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const finishClose = useCallback(() => {
    setExiting(true)
    window.setTimeout(() => onClose(), 300)
  }, [onClose])

  const panelVisible = entered && !exiting

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-transparent"
        onClick={finishClose}
        aria-label="Close panel"
      />
      <TradingDrawerPanel
        exiting={exiting}
        panelVisible={panelVisible}
        titleId={titleId}
        title={title}
        subtitle={subtitle}
        icon={icon}
        finishClose={finishClose}
        showCollapse={showCollapse}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        frameContent={frameContent}
      >
        {children}
      </TradingDrawerPanel>
    </div>
  )
}

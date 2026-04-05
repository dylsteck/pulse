import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { TradingDrawerPanel } from '@/components/trading/trading-drawer-panel'
import { DialogPrimitive } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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
  const closingRef = useRef(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const finishClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setExiting(true)
    window.setTimeout(() => onClose(), 300)
  }, [onClose])

  const panelVisible = entered && !exiting

  return (
    <DialogPrimitive.Root
      modal="trap-focus"
      open
      onOpenChange={(next) => {
        if (!next) finishClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-transparent data-open:pointer-events-auto"
        />
        <DialogPrimitive.Popup
          className={cn(
            'pointer-events-auto fixed z-[51] flex max-h-[min(85vh,720px)] w-auto flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg outline-none',
            'will-change-[transform,opacity]',
            'transition-all duration-300 ease-in-out motion-reduce:duration-0',
            'bottom-3 right-3 left-3 sm:bottom-5 sm:right-5 sm:left-auto',
            'sm:w-[min(100vw-2rem,380px)]',
            panelVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0',
          )}
          initialFocus
          finalFocus
          onClick={(e) => e.stopPropagation()}
        >
          <TradingDrawerPanel
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
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

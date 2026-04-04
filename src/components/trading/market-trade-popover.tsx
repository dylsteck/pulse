import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LineChart } from 'lucide-react'
import type { Market, MarketOutcome } from '@/lib/types'
import { MarketTradeForm } from '@/components/trading/market-trade-form'
import { TradingDrawer } from '@/components/trading/trading-drawer'
import { Button } from '@/components/ui/button'

interface MarketTradePopoverProps {
  market: Market
  defaultOutcome?: 'yes' | 'no'
  outcome?: MarketOutcome
}

export function MarketTradePopover({
  market,
  defaultOutcome = 'yes',
  outcome,
}: MarketTradePopoverProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const drawerTitle = outcome?.name ?? market.title

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        Trade
      </Button>
      {mounted && open
        ? createPortal(
            <TradingDrawer
              title={drawerTitle}
              subtitle="Polymarket"
              titleId="market-trade-drawer-title"
              icon={
                <LineChart className="size-4 text-muted-foreground" aria-hidden />
              }
              frameContent
              showCollapse={false}
              onClose={() => setOpen(false)}
            >
              <MarketTradeForm
                market={market}
                defaultOutcome={defaultOutcome}
                outcome={outcome}
                onClose={() => setOpen(false)}
              />
            </TradingDrawer>,
            document.body,
          )
        : null}
    </>
  )
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDownUpIcon } from 'lucide-react'
import type { SwapPanelProps } from '@/components/trading/swap-constants'
import { SwapDrawer } from '@/components/trading/swap-drawer'
import { Button } from '@/components/ui/button'

export function SwapPopover({
  defaultFromToken = 'ETH',
  defaultToToken = 'USDC',
}: SwapPanelProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2 px-4 py-2 text-sm font-medium"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <ArrowDownUpIcon className="size-4 shrink-0" />
        Swap
      </Button>
      {mounted && open
        ? createPortal(
            <SwapDrawer
              defaultFromToken={defaultFromToken}
              defaultToToken={defaultToToken}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  )
}

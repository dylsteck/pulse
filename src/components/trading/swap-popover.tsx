import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDownUpIcon } from 'lucide-react'
import type { SwapPanelProps } from '@/components/trading/swap-constants'
import { PulsePillButton } from '@/components/trading/pulse-pill-button'
import { SwapDrawer } from '@/components/trading/swap-drawer'

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
      <PulsePillButton
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <ArrowDownUpIcon className="size-3.5 shrink-0" aria-hidden />
        Swap
      </PulsePillButton>
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

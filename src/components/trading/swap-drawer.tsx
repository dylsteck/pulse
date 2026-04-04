import { useState } from 'react'
import { WalletIcon } from 'lucide-react'
import type { SwapPanelProps } from '@/components/trading/swap-constants'
import { SwapForm } from '@/components/trading/swap-form'
import { TradingDrawer } from '@/components/trading/trading-drawer'

export function SwapDrawer({
  defaultFromToken,
  defaultToToken,
  onClose,
}: SwapPanelProps & { onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TradingDrawer
      title="Swap"
      subtitle="Base"
      titleId="swap-drawer-title"
      icon={<WalletIcon className="size-4 text-muted-foreground" aria-hidden />}
      collapsed={collapsed}
      frameContent
      onClose={onClose}
      onToggleCollapse={() => setCollapsed((c) => !c)}
      showCollapse
    >
      <SwapForm
        defaultFromToken={defaultFromToken}
        defaultToToken={defaultToToken}
        onClose={onClose}
      />
    </TradingDrawer>
  )
}

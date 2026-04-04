import type { SwapStatus } from '@/hooks/use-swap'
import { USDC_BASE } from '@/lib/wagmi'

export const SWAP_TOKENS: Record<
  string,
  { address: `0x${string}`; symbol: string; decimals: number }
> = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
  },
  USDC: { address: USDC_BASE, symbol: 'USDC', decimals: 6 },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    decimals: 18,
  },
}

export const SWAP_STATUS_LABELS: Record<SwapStatus, string> = {
  idle: '',
  quoting: 'Getting quote...',
  confirming: 'Confirm in wallet...',
  swapping: 'Swapping...',
  complete: 'Swap complete!',
  error: 'Swap failed',
}

export interface SwapPanelProps {
  defaultFromToken?: string
  defaultToToken?: string
}

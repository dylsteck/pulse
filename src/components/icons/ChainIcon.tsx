import { arbitrum, base, mainnet, optimism } from 'wagmi/chains'
import { BaseIcon } from './BaseIcon'
import { EthereumIcon } from './EthereumIcon'
import { OptimismIcon } from './OptimismIcon'
import { ArbitrumIcon } from './ArbitrumIcon'
import { SolanaIcon } from './SolanaIcon'
import type { SVGProps } from 'react'

// Solana is not EVM — use the canonical Wormhole/deBridge chain ID
export const SOLANA_CHAIN_ID = 1399811149

const CHAIN_ICONS: Partial<Record<number, React.ComponentType<SVGProps<SVGSVGElement>>>> = {
  [mainnet.id]: EthereumIcon,
  [optimism.id]: OptimismIcon,
  [arbitrum.id]: ArbitrumIcon,
  [base.id]: BaseIcon,
  [SOLANA_CHAIN_ID]: SolanaIcon,
}

interface ChainIconProps extends SVGProps<SVGSVGElement> {
  chainId: number
}

export function ChainIcon({ chainId, ...props }: ChainIconProps) {
  const Icon = CHAIN_ICONS[chainId]
  if (!Icon) return null
  return <Icon {...props} />
}

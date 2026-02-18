import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'

export type WalletState = {
  connected: boolean
  address: `0x${string}` | null
  connectEmbedded: () => void
  connectExternal: () => void
  disconnect: () => void
}

export function useWallet(): WalletState {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const cbConnector = wagmiConfig.connectors.find((c) => c.id === 'coinbaseWalletSDK')
  const injectedConnector = wagmiConfig.connectors.find((c) => c.id === 'injected')

  return {
    connected: isConnected,
    address: address ?? null,
    connectEmbedded: () => {
      if (cbConnector) connect({ connector: cbConnector })
    },
    connectExternal: () => {
      if (injectedConnector) connect({ connector: injectedConnector })
    },
    disconnect,
  }
}

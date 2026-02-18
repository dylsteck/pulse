import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { wagmiConfig, isCDPEmbeddedEnabled, CDP_CONNECTOR_ID } from '@/lib/wagmi'

export type WalletState = {
  connected: boolean
  address: `0x${string}` | null
  cdpEmbeddedAvailable: boolean
  connectEmbedded: () => void
  connectExternal: () => void
  disconnect: () => void
}

export function useWallet(): WalletState {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const cdpConnector = wagmiConfig.connectors.find((c) => c.id === CDP_CONNECTOR_ID)
  const cbConnector = wagmiConfig.connectors.find((c) => c.id === 'coinbaseWalletSDK')
  const injectedConnector = wagmiConfig.connectors.find((c) => c.id === 'injected')

  return {
    connected: isConnected,
    address: address ?? null,
    cdpEmbeddedAvailable: isCDPEmbeddedEnabled,
    connectEmbedded: () => {
      if (isCDPEmbeddedEnabled && cdpConnector) {
        connect({ connector: cdpConnector })
      } else if (cbConnector) {
        connect({ connector: cbConnector })
      }
    },
    connectExternal: () => {
      if (injectedConnector) connect({ connector: injectedConnector })
    },
    disconnect,
  }
}

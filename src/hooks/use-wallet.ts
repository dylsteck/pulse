import { useAccount, useDisconnect } from 'wagmi'

export type WalletState = {
  connected: boolean
  address: `0x${string}` | null
  disconnect: () => void
}

/** @deprecated Use useAuth() from @/components/providers/auth-provider instead */
export function useWallet(): WalletState {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return {
    connected: isConnected,
    address: address ?? null,
    disconnect,
  }
}

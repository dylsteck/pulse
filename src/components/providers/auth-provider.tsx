import {
  
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { toViemAccount } from '@coinbase/cdp-core'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
} from 'wagmi'
import { injected } from '@wagmi/connectors'
import type {ReactNode} from 'react';
import type { LocalAccount } from 'viem'
import { cdpProjectId } from '@/lib/wagmi'

type AuthMode = 'email' | 'wallet' | null

interface CdpState {
  isSignedIn: boolean
  currentUser: { evmAccounts?: Array<{ address: string }> } | undefined
  evmAddress: string | undefined
  signOut: () => Promise<void>
}

interface AuthContextData {
  isSignedIn: boolean
  isLoading: boolean
  isConnecting: boolean
  authMode: AuthMode
  evmAddress: `0x${string}` | undefined
  viemAccount: LocalAccount | undefined
  signOut: () => Promise<void>
  connectWallet: () => Promise<void>
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

// Separate component that safely calls CDP hooks only when CDPReactProvider exists
function CdpBridge({ onState }: { onState: (state: CdpState) => void }) {
  // Dynamic import to avoid calling hooks outside provider during SSR
  const [hooks, setHooks] = useState<typeof import('@coinbase/cdp-hooks') | null>(null)

  useEffect(() => {
    import('@coinbase/cdp-hooks').then(setHooks)
  }, [])

  if (!hooks) return null

  return <CdpBridgeInner hooks={hooks} onState={onState} />
}

function CdpBridgeInner({
  hooks,
  onState,
}: {
  hooks: typeof import('@coinbase/cdp-hooks')
  onState: (state: CdpState) => void
}) {
  const { isSignedIn } = hooks.useIsSignedIn()
  const { currentUser } = hooks.useCurrentUser()
  const { evmAddress } = hooks.useEvmAddress()
  const { signOut } = hooks.useSignOut()

  useEffect(() => {
    onState({
      isSignedIn,
      currentUser: currentUser as CdpState['currentUser'],
      evmAddress: evmAddress as string | undefined,
      signOut,
    })
  }, [isSignedIn, currentUser, evmAddress, signOut, onState])

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasCdp = !!cdpProjectId

  // CDP state (populated by CdpBridge when CDP is available)
  const [cdpState, setCdpState] = useState<CdpState>({
    isSignedIn: false,
    currentUser: undefined,
    evmAddress: undefined,
    signOut: async () => {},
  })

  const handleCdpState = useCallback((state: CdpState) => {
    setCdpState(state)
  }, [])

  // Wagmi (injected wallet) auth
  const {
    address: wagmiAddress,
    isConnected: wagmiIsConnected,
    isConnecting: wagmiIsConnecting,
  } = useAccount()
  const { connect, isPending: connectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: wagmiWalletClient } = useWalletClient()

  const [viemAccount, setViemAccount] = useState<LocalAccount | undefined>(
    undefined,
  )
  const [accountLoading, setAccountLoading] = useState(false)

  // Ready gate: skip loading if injected provider present, else wait for CDP init
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setReady(true)
      return
    }
    const t = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(t)
  }, [])

  // Auto-connect injected wallet if already authorized (no user prompt)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return
    try {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: Array<string>) => {
          if (accounts?.length > 0) {
            connect({ connector: injected() })
          }
        })
        .catch(() => {})
    } catch {
      // Some mobile wallet providers throw synchronously
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prefer injected wallet if connected
  const preferWallet = wagmiIsConnected && !!wagmiAddress

  const cdpIsSignedIn = cdpState.isSignedIn
  const cdpEvmAddress = cdpState.evmAddress
  const currentUser = cdpState.currentUser

  const authMode: AuthMode = preferWallet
    ? 'wallet'
    : cdpIsSignedIn
      ? 'email'
      : null
  const isSignedIn = cdpIsSignedIn || wagmiIsConnected
  const evmAddress = preferWallet
    ? wagmiAddress
    : cdpIsSignedIn
      ? (cdpEvmAddress as `0x${string}` | undefined)
      : undefined

  // CDP viem account creation
  const getViemAccount = useCallback(async (): Promise<
    LocalAccount | undefined
  > => {
    if (!currentUser?.evmAccounts?.[0]) return undefined
    try {
      setAccountLoading(true)
      const account = await toViemAccount(currentUser.evmAccounts[0])
      setViemAccount(account)
      return account
    } catch (error) {
      console.error('Failed to convert CDP account to viem account:', error)
      return undefined
    } finally {
      setAccountLoading(false)
    }
  }, [currentUser?.evmAccounts])

  // CDP viem account when email mode is active
  useEffect(() => {
    if (
      !cdpIsSignedIn ||
      !currentUser?.evmAccounts?.[0] ||
      preferWallet ||
      accountLoading
    )
      return
    if (!cdpEvmAddress) return
    const mismatch =
      !viemAccount ||
      viemAccount.address.toLowerCase() !== cdpEvmAddress.toLowerCase()
    if (mismatch) {
      getViemAccount()
    }
  }, [
    cdpIsSignedIn,
    currentUser?.evmAccounts,
    preferWallet,
    accountLoading,
    cdpEvmAddress,
    viemAccount,
    getViemAccount,
  ])

  // Clear viem account while wallet adapter is loading
  useEffect(() => {
    if (preferWallet && (!wagmiWalletClient || !wagmiAddress)) {
      setViemAccount(undefined)
    }
  }, [preferWallet, wagmiWalletClient, wagmiAddress])

  // Create viem account adapter for wallet mode
  useEffect(() => {
    if (wagmiIsConnected && wagmiAddress && wagmiWalletClient && preferWallet) {
      const address = wagmiAddress
      const client = wagmiWalletClient
      const adapter = {
        address,
        type: 'local' as const,
        source: 'custom' as const,
        publicKey: '0x' as `0x${string}`,
        signMessage: ({
          message,
        }: {
          message: Parameters<LocalAccount['signMessage']>[0]['message']
        }) => client.signMessage({ account: address, message }),
        signTypedData: (params: Parameters<LocalAccount['signTypedData']>[0]) =>
           
          client.signTypedData({ account: address, ...(params as any) }),
        signTransaction: (
          tx: Parameters<LocalAccount['signTransaction']>[0],
        ) =>
           
          client.signTransaction({ account: address, ...(tx as any) }),
      } as LocalAccount
      setViemAccount(adapter)
    }
  }, [wagmiIsConnected, wagmiAddress, wagmiWalletClient, preferWallet])

  // Clear viem account on sign out
  useEffect(() => {
    if (!isSignedIn) {
      setViemAccount(undefined)
    }
  }, [isSignedIn])

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return
    try {
      connect({ connector: injected() })
    } catch (err) {
      console.error('Wallet connect failed:', err)
    }
  }, [connect])

  const signOut = useCallback(async () => {
    setViemAccount(undefined)
    if (cdpIsSignedIn) {
      await cdpState.signOut()
    } else if (wagmiIsConnected) {
      disconnect()
    }
  }, [cdpIsSignedIn, wagmiIsConnected, cdpState, disconnect])

  const isLoading = !isSignedIn && !ready
  const isConnecting = wagmiIsConnecting || connectPending

  const value = useMemo<AuthContextData>(
    () => ({
      isSignedIn,
      isLoading,
      isConnecting,
      authMode,
      evmAddress,
      viemAccount,
      signOut,
      connectWallet,
    }),
    [
      isSignedIn,
      isLoading,
      isConnecting,
      authMode,
      evmAddress,
      viemAccount,
      signOut,
      connectWallet,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {hasCdp && <CdpBridge onState={handleCdpState} />}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

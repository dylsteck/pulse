import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Pulse',
      preference: 'smartWalletOnly',
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})

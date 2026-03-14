import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi'

const projectId = import.meta.env.VITE_CDP_PROJECT_ID as string | undefined

const cdpConnector =
  projectId &&
  createCDPEmbeddedWalletConnector({
    cdpConfig: { projectId },
    providerConfig: {
      chains: [base],
      transports: {
        [base.id]: http(),
      },
    },
  })

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: cdpConnector ? [cdpConnector] : [],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})

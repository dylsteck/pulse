import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'
import { createCDPEmbeddedWalletConnector, CDP_CONNECTOR_ID } from '@coinbase/cdp-wagmi'
import type { Config } from '@coinbase/cdp-core'

const cdpProjectId = import.meta.env.VITE_CDP_PROJECT_ID as string | undefined
export const isCDPEmbeddedEnabled = Boolean(cdpProjectId)

export const cdpConfig = isCDPEmbeddedEnabled
  ? ({ projectId: cdpProjectId!, ethereum: { createOnLogin: 'eoa' as const } } satisfies Config)
  : null

const cdpConnector = isCDPEmbeddedEnabled
  ? createCDPEmbeddedWalletConnector({
      cdpConfig: cdpConfig!,
      providerConfig: {
        chains: [base],
        transports: {
          [base.id]: http(),
        },
      },
    })
  : null

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    ...(cdpConnector ? [cdpConnector] : []),
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

export { CDP_CONNECTOR_ID }

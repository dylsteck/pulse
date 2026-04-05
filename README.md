# Pulse

![Pulse screenshot April 2026](https://i.imgur.com/f62SGXf.png)

Pulse is a fast and minimal trading interface across many different assets: tokens, prediction markets, perps, and memes. The goal is both to have a simple interface getting the pulse of what's happening across all these assets, and also to be able to easily transact across them. Built by [@dylsteck](https://github.com/dylsteck)

## Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework (SSR + file-based routing)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Liveline](https://benji.org/liveline) — real-time animated price charts
- [Codex](https://docs.codex.io/) — onchain token data (prices, volume, chart history)
- [Polymarket](https://docs.polymarket.com/) — prediction market data
- [Hyperliquid](https://hyperliquid.gitbook.io/) — perpetual futures data
- [wagmi v3](https://wagmi.sh/) — wallet connection (injected, Coinbase Wallet, Base Account)

## Getting started

```bash
bun install
cp .env.example .env   # fill in API keys
bun run dev            # http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env` and fill in the keys you need.

| Variable                        | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| `CODEX_API_KEY`                 | Onchain token data (prices, volume, history) |
| `VITE_WALLETCONNECT_PROJECT_ID` | Optional: enables WalletConnect connector    |

## Routes

| Route                | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `/tokens`            | Base token list with live prices, volume, market cap |
| `/markets`           | Polymarket prediction markets with outcome cards     |
| `/perps`             | Hyperliquid perpetual futures                        |
| `/memes`             | Solana meme tokens                                   |
| `/asset/:identifier` | Detail page for any asset with Liveline chart        |

## Asset Identifier Format (CAIP-19)

All assets are identified using a CAIP-19-like scheme. The format is:

```
chain_id/asset_namespace:asset_reference
```

The identifier is percent-encoded when used in URLs.

| Asset Type     | Chain ID                                  | Namespace   | Example                             |
| -------------- | ----------------------------------------- | ----------- | ----------------------------------- |
| Base    | `eip155:8453`                             | `erc20`     | `eip155:8453/erc20:0x4ed4...efed`   |
| Solana | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | `token`     | `solana:.../token:ABC123...`        |
| Polymarket        | `polymarket:mainnet`                      | `event`     | `polymarket:mainnet/event:12345`    |
| Hyperliquid         | `hyperliquid:mainnet`                     | `perp`      | `hyperliquid:mainnet/perp:btc-perp` |

**Pulse-defined chain IDs:** `polymarket:mainnet` and `hyperliquid:mainnet` are app-stable identifiers for Polymarket and Hyperliquid; they are not CAIP-2 registry entries. Solana memes use the [Solana CAIP-19 draft](https://namespaces.chainagnostic.org/solana/caip19) shape (`token` + mint). Older bookmark URLs may use `spl-token` or `spl` instead of `token`; those still decode.

### URL Examples

```
# Base token
/asset/eip155%3A8453%2Ferc20%3A0x4ed4e862860bed51a9570b96d89af5e1b0efefed

# Polymarket market
/asset/polymarket%3Amainnet%2Fevent%3A12345

# Solana meme (canonical)
/asset/solana%3A5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp%2Ftoken%3AABC123

# Hyperliquid perp
/asset/hyperliquid%3Amainnet%2Fperp%3Abtc-perp
```

### Using CAIP-19 Utilities

```typescript
import {
  buildTokenId,
  buildMarketId,
  buildMemeId,
  buildPerpId,
  encodeAssetId,
  decodeAssetId,
  encodeForUrl,
} from '@/lib/caip19'

// Build identifiers
const tokenId = buildTokenId('0x4ed4e862860bed51a9570b96d89af5e1b0efefed')
const marketId = buildMarketId('12345')
const perpId = buildPerpId('BTC')
const memeId = buildMemeId('ABC123...')

// Encode for URL
const urlSafeId = encodeForUrl(tokenId)

// Decode an identifier
const parsed = decodeAssetId(tokenId)
// { type: 'tokens', identifier: { chainId: 'eip155:8453', namespace: 'erc20', reference: '0x...' }, raw: '...' }
```

## Scripts

```bash
bun run dev      # dev server
bun run build    # production build
bun run check    # format + lint
```

## Deploy

Since this is a TanStack Start app, it should be simple to deploy across providers. For your convenience, you can click the buttons below to easily deploy to either Railway or Vercel.

| Platform |                                                                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Railway  | [![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/x89o4H?referralCode=-vlTG4&utm_medium=integration&utm_source=template&utm_campaign=generic) |
| Vercel   | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdylsteck%2Fpulse&env=CODEX_API_KEY)                 |

# Pulse

Fast, minimal trading interface for Base tokens, Polymarket prediction markets, Zora creator tokens, Tortoise music, and Hyperliquid perps. Light and dark mode, desktop and mobile.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.app/template/ZweBXA?referralCode=xsbY2R)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdylsteck%2Fpulse&env=CODEX_API_KEY)

## Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework (SSR + file-based routing)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Liveline](https://benji.org/liveline) — real-time animated price charts
- [Codex](https://docs.codex.io/) — onchain token data (prices, volume, chart history)
- [Polymarket](https://docs.polymarket.com/) — prediction market data
- [Zora](https://docs.zora.co/) — creator token data
- [Tortoise](https://tortoise.studio/) — music / audio collectibles
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

| Route              | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `/tokens`          | Base token list with live prices, volume, market cap |
| `/markets`         | Polymarket prediction markets with outcome cards     |
| `/creators`        | Zora creator tokens with market cap and holder data  |
| `/music`           | Tortoise audio collectibles                          |
| `/perps`           | Hyperliquid perpetual futures                        |
| `/asset/:type/:id` | Detail page for any asset with Liveline chart        |

## Scripts

```bash
bun run dev      # dev server
bun run build    # production build
bun run check    # format + lint
```

# Pulse

Fast, minimal trading interface for Base tokens and Polymarket prediction markets. Robinhood-ish aesthetic — light, breathable, desktop-first.

## Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework (SSR + file-based routing)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Liveline](https://benji.org/liveline) — real-time animated price charts
- [Spandex](https://spandex.sh/) — Base token meta-aggregator (post-MVP)
- [Polymarket CLOB](https://docs.polymarket.com/) — prediction market trading (post-MVP)
- [CDP Embedded EOA Wallet](https://docs.cdp.coinbase.com/embedded-wallets/welcome) — default wallet (post-MVP)

## Getting started

```bash
bun install
cp .env.example .env   # fill in API keys (not required for mock mode)
bun run dev            # http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env` and fill in the keys you need. All integrations default to **mock data** while `VITE_USE_LIVE_DATA=false`, so the app runs fully without any keys during development.

| Variable | Purpose |
|---|---|
| Spandex | Public API — no key needed |
| `CODEX_API_KEY` | Onchain token data (prices, volume, history) |
| `CDP_PROJECT_ID / API_KEY_NAME / API_KEY_PRIVATE_KEY` | CDP embedded EOA wallet |
| `RELAY_API_KEY` | Cross-chain trade routing via Relay |
| `VITE_USE_LIVE_DATA` | Set to `true` to switch from mock data to live APIs |

## Routes

| Route | Description |
|---|---|
| `/tokens` | Base token trading — movers rail, search, Liveline chart, buy/sell |
| `/markets` | Polymarket prediction markets — trending cards with inline trade form |

## Scripts

```bash
bun run dev      # dev server
bun run build    # production build
bun run check    # format + lint
bun run test     # run tests
```

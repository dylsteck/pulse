# Agents — Pulse

Context for AI agents working in this codebase.

## What this is

Pulse is a trading interface for Base tokens (via Spandex) and Polymarket prediction markets.

## Project structure

```
src/
├── routes/
│   ├── __root.tsx       Global shell (Header, fonts, devtools)
│   ├── index.tsx        Redirects → /tokens
│   ├── tokens.tsx       Base token trading page
│   └── markets.tsx      Polymarket prediction markets page
├── components/
│   ├── layout/
│   │   └── header.tsx              Logo + tab nav + wallet button
│   ├── trading/
│   │   ├── movers-rail.tsx         Horizontal scroll of biggest movers
│   │   ├── token-search.tsx        Combobox: search by name or contract address
│   │   ├── liveline-chart.tsx      Liveline wrapper (280px, light theme)
│   │   └── trade-form.tsx          Inline buy/sell form
│   ├── markets/
│   │   ├── market-card.tsx         Prediction market card + inline trade panel
│   │   └── markets-list.tsx        3-column responsive grid of cards
│   └── wallet/
│       └── wallet-button.tsx       Connect/disconnect dropdown
├── hooks/
│   ├── use-token-price.ts          Simulated live price feed (setInterval random walk)
│   ├── use-movers.ts               Top movers sorted by |% change|
│   └── use-wallet.ts               Wallet connection state (mock)
└── lib/
    ├── mock/
    │   ├── tokens.ts               8 Base tokens with price history
    │   ├── markets.ts              6 Polymarket-style events
    │   └── movers.ts               Top movers helper
    └── utils.ts                    cn() utility
```

## Key conventions

- **Package manager**: Always use bun for install, dev, build, test, and other npm scripts. If bun isn't in the sandbox, run `curl -fsSL https://bun.sh/install | bash` and `source ~/.bashrc`.
- **Routing**: TanStack Router file-based. New routes go in `src/routes/`. Run dev server to auto-regenerate `routeTree.gen.ts`, or update it manually.
- **Path alias**: `@/` maps to `src/` (configured in `tsconfig.json`).
- **Styling**: Tailwind v4 + shadcn. Design tokens are in `src/styles.css`. Raw color values used: `#FFFFFF` bg, `#F9F9F9` sections, `#E5E5E5` borders, `#22c55e` green, `#ef4444` red.
- **UI components**: Prefer existing shadcn components in `src/components/ui/` before creating new ones. They're built on `@base-ui/react`.
- **Mock vs live**: All data comes from `src/lib/mock/`. When wiring real APIs, keep mock as fallback.
- **No auto-commit**: Don't commit unless explicitly asked.

## Integrations to wire (post-MVP)

| Integration | Docs | What it replaces |
|---|---|---|
| Spandex | https://spandex.sh/ | Mock token prices + swap execution — **no API key required, public API** |
| Codex | https://docs.codex.io/ | Mock price history + volume |
| Polymarket CLOB | https://docs.polymarket.com/ | Mock market data + trade execution |
| wagmi connectors | wagmi.sh/react | Wallet connection — injected, Coinbase Wallet, Base Account, optional WalletConnect |
| Relay | https://docs.relay.link/ | Trade routing |

## Liveline chart API

```ts
<Liveline
  data={data}        // { time: number; value: number }[]
  value={number}     // current price (drives live dot)
  color={string}     // hex color — green (#22c55e) when up, red (#ef4444) when down
  theme="light"
  badge momentum fill grid
/>
```

## Running

Use **bun** for all package operations (install, dev, build, test, etc.). If bun is not available in the sandbox, install it first:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc   # or restart the shell so bun is on PATH
```

Then:

```bash
bun install
bun run dev     # localhost:3000
bun run build   # production build (catches type errors)
```

# Agents — Pulse

Context for AI agents working in this codebase.

## What this is

Pulse is a trading interface across tokens (Base), prediction markets (Polymarket), perpetual futures (Hyperliquid), and meme tokens (Solana/Pump.fun via GeckoTerminal).

## Project structure

```
src/
├── routes/
│   ├── __root.tsx       Global shell (Header, fonts, devtools)
│   ├── index.tsx        Main landing page with mode tabs
│   ├── tokens.tsx       Base token trading page
│   ├── markets.tsx      Polymarket prediction markets page
│   ├── memes.tsx        Solana meme tokens (Pump.fun via GeckoTerminal)
│   ├── perps.tsx        Hyperliquid perps
│   ├── asset.$identifier  Asset detail page (uses CAIP-19 identifier format)
│   └── api/
│       ├── geckoterminal/
│       │   ├── memes.ts            Pump.fun pools (filtered by volume/liquidity)
│       │   ├── ohlcv.ts            Pool OHLCV for meme charts (poolAddress, window)
│       │   └── token-detail.ts     Token info + metadata
│       ├── codex.ts                Base token bars (price history)
│       ├── polymarket/             Events + history
│       ├── hyperliquid.ts         Perps + candles
│       └── tortoise/               Songs, trending, audio
├── components/
│   ├── layout/header.tsx
│   ├── ui/                         shadcn components only
│   ├── dashboard/
│   │   ├── unified-list.tsx        Orchestrator for list/grid (tokens, markets, memes, etc.)
│   │   ├── hero-banner.tsx         Carousel orchestrator
│   │   ├── shared/                 LoadingPanel, ErrorPanel, MemeRetryState, ChanceGauge, CardGrid
│   │   ├── inline-charts/          InlineTokenChart, InlineMemeChart, InlineMarketChart, etc.
│   │   ├── cards/                  TokenGridCard, MarketGridCard, MemeGridCard, etc.
│   │   ├── grids/                  TokenGrid, MarketGrid, MemeGrid, etc. (use CardGrid wrapper)
│   │   ├── tables/                 TokenTable, MarketTable, MemeTable, etc.
│   │   ├── tabs/mode-tabs.tsx      Mode tab buttons
│   │   ├── hero/                   AssetCard, MemeCard, MarketCard, SidebarRow
│   │   └── layout-toggle.tsx        List/grid toggle
│   ├── asset-detail/
│   │   ├── shared.tsx              StatItem, DetailSection, DetailRow, ChangeBadge, DetailMessage
│   │   └── *-detail.tsx            TokenDetail, MarketDetail, PerpDetail, MemeDetail, CreatorDetail
│   ├── asset-detail-page.tsx       Orchestrator for asset detail views
│   ├── command-palette/            AssetIcon, CommandPalette
│   └── trading/liveline-chart.tsx  Liveline wrapper (LivelineChart, SparklineChart)
├── hooks/
│   ├── use-window-change.ts        Shared chart window/timeframe handler
│   ├── use-token-price.ts          Live price (tokens)
│   ├── use-token-bars.ts          Codex bars for Base tokens
│   ├── use-meme-tokens.ts         GeckoTerminal meme tokens (infinite)
│   ├── use-meme-ohlcv.ts          GeckoTerminal OHLCV for meme pool charts
│   ├── use-market-history.ts      Polymarket history
│   ├── use-hyperliquid-candles.ts  Perp candles
│   └── use-live-tokens.ts, use-live-markets.ts, etc.
└── lib/
    ├── geckoterminal.ts           MemeToken, fetchMemeTokens, transform
    ├── codex.ts                   Base tokens + bars
    ├── caip19.ts                  CAIP-19 asset identifier encode/decode
    └── ...
```

## Key conventions

- **Package manager**: Always use bun for install, dev, build, test, and other npm scripts. If bun isn't in the sandbox, run `curl -fsSL https://bun.sh/install | bash` and `source ~/.bashrc`.
- **Routing**: TanStack Router file-based. New routes go in `src/routes/`. Run dev server to auto-regenerate `routeTree.gen.ts`, or update it manually.
- **Path alias**: `@/` maps to `src/` (configured in `tsconfig.json`).
- **Styling**: Tailwind v4 + shadcn. Design tokens are in `src/styles.css`. Raw color values used: `#FFFFFF` bg, `#F9F9F9` sections, `#E5E5E5` borders, `#22c55e` green, `#ef4444` red.
- **UI components**: Use **shadcn/ui** for all UI. Prefer existing components in `src/components/ui/` before creating new ones. They're built on `@base-ui/react`. For guidance on adding, styling, and composing shadcn components, refer to the shadcn skill at `.agents/skills/shadcn/SKILL.md` and its rules in `.agents/skills/shadcn/`.
- **Live data**: All data is fetched from live APIs via server-side proxy routes in `src/routes/api/`. No mock data layer.
- **No auto-commit**: Don't commit unless explicitly asked.

## Security guardrails

- **No generic upstream relays**: Never expose a route that forwards arbitrary client-controlled request bodies to third-party APIs. Build upstream request bodies on the server from validated params only.
- **Secret-backed APIs**: Never pair `process.env` API keys or auth headers with raw client-controlled upstream payloads. Secret-backed routes must validate input, rate-limit callers, and use operation-specific endpoints.
- **Outbound URLs**: Treat upstream-provided URLs as untrusted input. Only render clickable links after explicit `http:` / `https:` validation.
- **Cache headers for account data**: Any account-, wallet-, or user-specific API response must use `Cache-Control: private, no-store` unless there is a deliberate, documented reason not to.

## Integrations to wire (post-MVP)

| Integration      | Docs                         | What it replaces                                                                    |
| ---------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| Spandex          | https://spandex.sh/          | Mock token prices + swap execution — **no API key required, public API**            |
| Codex            | https://docs.codex.io/       | Mock price history + volume                                                         |
| Polymarket CLOB  | https://docs.polymarket.com/ | Mock market data + trade execution                                                  |
| wagmi connectors | wagmi.sh/react               | Wallet connection — injected, Coinbase Wallet, Base Account, optional WalletConnect |
| Relay            | https://docs.relay.link/     | Trade routing                                                                       |

## GeckoTerminal API (memes / pump.fun)

We proxy GeckoTerminal at `/api/geckoterminal/*`. Full OAS: https://api.geckoterminal.com/docs/v2/swagger.json

**Endpoints we use:**

| Path                                                             | Purpose                                         |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| `GET /networks/{network}/dexes/{dex}/pools`                      | Top pools by DEX (we use `solana` + `pump-fun`) |
| `GET /networks/{network}/pools/{pool_address}/ohlcv/{timeframe}` | OHLCV for charts                                |
| `GET /networks/{network}/tokens/{address}` + `/info`             | Token detail + metadata                         |

**Pools params:**

- `page` — 1–10 (max 10 pages on public API)
- `sort` — `h24_volume_usd_desc` | `h24_tx_count_desc`
- `include` — `base_token` (for name/symbol/image)

**Pool attributes:** `volume_usd.h24`, `reserve_in_usd`, `base_token_price_usd`, `price_change_percentage.h24`

**OHLCV params:** `timeframe` = `day`|`hour`|`minute`, `aggregate` = `1`|`5`|`15` (minute), `limit` max 1000

**Rate limit:** ~10 calls/min (public). Set `Accept: application/json;version=20230203`.

## Liveline chart API

```ts
<LivelineChart
  data={data}                    // { time: number; value: number }[]
  value={number}                 // current price (drives live dot)
  height={isMobile ? 200 : 340} // responsive height
  window={WINDOW_LABEL_TO_SECS[windowLabel]}   // timeframe in seconds
  onWindowChange={handleWindowChange}           // from useWindowChange hook
  formatValue={(v) => `$${formatPrice(v)}`}     // tooltip formatter
  isLoading={isLoading}
  emptyText="No chart data available"
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

## Cursor Cloud specific instructions

- **Single service**: The entire app is one process (`bun run dev` on port 3000). No Docker, no database, no external services needed locally.
- **Bun is pre-installed** via the update script. Just run `bun install` if deps look stale, then `bun run dev`.
- **`.env` setup**: Copy `.env.example` to `.env`. All API keys are optional — the app falls back to mock data in `src/lib/mock/`. The `/tokens` page uses live Codex data when `CODEX_API_KEY` is set; without it, mock data is shown.
- **Lint**: `bun run lint` (ESLint). The codebase has pre-existing lint errors (import ordering, array-type style). `bun run check` runs Prettier + ESLint with `--fix`.
- **Tests**: `bun run test` (bun:test). Tests are under `src/lib/__tests__/`, `src/lib/hyperliquid/__tests__/`, `src/hooks/__tests__/`, and `src/components/.../__tests__/`.
- **Build**: `bun run build` produces a Nitro server bundle in `.output/`. This also surfaces TypeScript errors.
- **Route generation**: TanStack Router auto-generates `src/routeTree.gen.ts` when the dev server runs. If routes look stale, start the dev server to regenerate.

## Component layout and design principles

- **Feature-based layout**: Components are organized by feature, not by atoms/molecules/organisms. Use nested folders for related subcomponents (e.g. `dashboard/cards/`, `dashboard/grids/`).
- **`components/ui/`**: Reserved for shadcn components only. Do not add feature-specific components here.
- **Orchestrators**: Large pages (UnifiedList, HeroBanner, AssetDetailPage) are orchestrators that import and compose smaller components. Keep orchestrators slim; move inline logic into extracted components.
- **Shared hooks**: Use `useIsMobile`, `useInfiniteScroll`, `useDocumentHidden`, `useWindowChange` from `@/hooks/` instead of duplicating logic.
- **Shared detail components**: `asset-detail/shared.tsx` exports `StatItem`, `DetailSection`, `DetailRow`, `ChangeBadge`, `DetailMessage`. Use these across all detail pages for consistent flat styling. Don't wrap stats in card containers.
- **CardGrid**: All grid views (`token-grid`, `market-grid`, `meme-grid`, `trending-grid`) use the shared `CardGrid` component from `dashboard/shared/card-grid.tsx` which sets `gridAutoRows: '200px'` and responsive columns. Don't duplicate grid layout.
- **Flat layout**: Detail pages use flat stats grids and section headings — no card wrappers around stats or detail sections.
- **File size**: Prefer files under ~300 lines. Extract subcomponents when a file grows large. ESLint enforces `max-lines` (300) and `max-lines-per-function` (80) with overrides for test files.

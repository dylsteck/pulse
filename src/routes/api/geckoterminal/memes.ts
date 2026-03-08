import { createFileRoute } from '@tanstack/react-router'
import { readUpstreamJson } from '@/lib/server/upstream'

const GECKO_HEADERS = {
  Accept: 'application/json;version=20230203',
}

/** Minimum 24h volume (USD) — higher = better quality */
const MIN_VOLUME_USD = 50_000
/** Minimum liquidity (USD) — exclude dust/rugs */
const MIN_LIQUIDITY_USD = 2_000
/** Minimum market cap / FDV (USD) — higher = established tokens */
const MIN_MCAP_USD = 25_000

function toNum(v: string | number | null | undefined): number {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export const Route = createFileRoute('/api/geckoterminal/memes')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const rawPage = url.searchParams.get('page') ?? '1'
          const parsed = Math.max(1, Math.min(100, Math.floor(Number(rawPage)) || 1))
          const page = String(parsed)
          const params = new URLSearchParams({
            sort: 'h24_volume_usd_desc',
            include: 'base_token',
            page,
          })

          const json = (await readUpstreamJson(
            `https://api.geckoterminal.com/api/v2/networks/solana/dexes/pump-fun/pools?${params.toString()}`,
            {
              headers: GECKO_HEADERS,
              cacheTtlMs: 60_000,
            },
          )) as {
            data?: Array<{
              attributes?: {
                volume_usd?: { h24?: string | null }
                reserve_in_usd?: string | null
                market_cap_usd?: string | null
                fdv_usd?: string | null
              }
            }>
            included?: unknown[]
          }

          const data = json.data ?? []
          const filtered = data.filter((pool) => {
            const vol = toNum(pool.attributes?.volume_usd?.h24)
            const liq = toNum(pool.attributes?.reserve_in_usd)
            const mcap = toNum(pool.attributes?.market_cap_usd)
            const fdv = toNum(pool.attributes?.fdv_usd)
            const valuation = mcap > 0 ? mcap : fdv
            return (
              vol >= MIN_VOLUME_USD &&
              liq >= MIN_LIQUIDITY_USD &&
              valuation >= MIN_MCAP_USD
            )
          })

          // Fallback: if all pools filtered out, return unfiltered data
          const result = filtered.length > 0 ? filtered : data

          // nextPage: upstream returned full page → more pages available for infinite scroll
          const nextPage = data.length >= 20 ? parsed + 1 : null

          return Response.json(
            { ...json, data: result, nextPage },
            {
              headers: {
                'Cache-Control':
                  'public, max-age=60, stale-while-revalidate=300',
              },
            },
          )
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Upstream request failed.'
          return Response.json(
            { error: message, data: [] },
            {
              status: 502,
              headers: { 'Cache-Control': 'no-store' },
            },
          )
        }
      },
    },
  },
})

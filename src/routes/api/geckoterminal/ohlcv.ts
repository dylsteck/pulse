import { createFileRoute } from '@tanstack/react-router'
import { readUpstreamJson } from '@/lib/server/upstream'

const GECKO_HEADERS = {
  Accept: 'application/json;version=20230203',
}

/** Map window label to GeckoTerminal OHLCV params: [timeframe, aggregate, limit] */
const WINDOW_TO_OHLCV: Record<
  string,
  { timeframe: 'minute' | 'day'; aggregate: number; limit: number }
> = {
  '15m': { timeframe: 'minute', aggregate: 1, limit: 20 },
  '1H': { timeframe: 'minute', aggregate: 1, limit: 65 },
  '6H': { timeframe: 'minute', aggregate: 15, limit: 24 },
  '1D': { timeframe: 'minute', aggregate: 60, limit: 24 },
}

const POOL_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export const Route = createFileRoute('/api/geckoterminal/ohlcv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const poolAddress = url.searchParams.get('poolAddress')
          const windowLabel = url.searchParams.get('window') ?? '1D'

          if (!poolAddress) {
            return Response.json(
              { error: 'Missing poolAddress.', bars: [] },
              {
                status: 400,
                headers: { 'Cache-Control': 'no-store' },
              },
            )
          }

          if (!POOL_ADDRESS_REGEX.test(poolAddress)) {
            return Response.json(
              { error: 'Invalid pool address format.', bars: [] },
              {
                status: 400,
                headers: { 'Cache-Control': 'no-store' },
              },
            )
          }

          const params = WINDOW_TO_OHLCV[windowLabel] ?? WINDOW_TO_OHLCV['1D']
          const { timeframe, aggregate, limit } = params

          const json = (await readUpstreamJson(
            `https://api.geckoterminal.com/api/v2/networks/solana/pools/${encodeURIComponent(poolAddress)}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}`,
            {
              headers: GECKO_HEADERS,
              cacheTtlMs: 60_000,
            },
          )) as {
            data?: {
              attributes?: {
                ohlcv_list?: Array<[number, number, number, number, number, number]>
              }
            }
          }

          const ohlcvList =
            json.data?.attributes?.ohlcv_list ?? []
          const bars = ohlcvList
            .map((row) => {
              const [timestamp, , , , close] = row
              return { time: timestamp, value: close }
            })
            .sort((a, b) => a.time - b.time)

          return Response.json(
            { bars },
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
            { error: message, bars: [] },
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

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import {
  getHyperliquidInfoClient,
  getHyperliquidSymbolConverter,
} from '@/lib/hyperliquid/clients'
import type {
  PerpMarketSnapshot,
  PerpCandlesResponse,
} from '@/lib/hyperliquid/service'

const PERP_INTERVAL_MAP: Record<string, '1m' | '15m' | '1h' | '4h' | '1d'> = {
  '15m': '1m',
  '1H': '1m',
  '6H': '15m',
  '1D': '1h',
}

const PERP_WINDOW_SECS: Record<string, number> = {
  '15m': 900,
  '1H': 3600,
  '6H': 21600,
  '1D': 86400,
}

export const Route = createFileRoute('/api/hyperliquid')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { type, params } = (await request.json()) as {
          type: string
          params?: Record<string, unknown>
        }
        const info = getHyperliquidInfoClient()

        switch (type) {
          case 'markets': {
            const converter = await getHyperliquidSymbolConverter()
            const [metaAndCtxs, mids] = await Promise.all([
              info.metaAndAssetCtxs(),
              info.allMids(),
            ])
            const [meta, ctxs] = metaAndCtxs

            const markets: PerpMarketSnapshot[] = meta.universe
              .map((asset, index) => {
                const ctx = ctxs[index]
                if (!ctx || asset.isDelisted) return null

                const assetId = converter.getAssetId(asset.name)
                if (assetId == null) return null

                const markPx = Number(ctx.markPx)
                const midPx = Number(
                  ctx.midPx ?? ctx.markPx ?? mids[asset.name] ?? 0,
                )
                const prevDayPx = Number(ctx.prevDayPx)
                const change24h =
                  prevDayPx > 0 ? ((midPx - prevDayPx) / prevDayPx) * 100 : 0

                return {
                  id: `${asset.name.toLowerCase()}-perp`,
                  assetId,
                  coin: asset.name,
                  markPx,
                  midPx,
                  prevDayPx,
                  change24h,
                  funding: Number(ctx.funding),
                  openInterest: Number(ctx.openInterest),
                  premium: Number(ctx.premium ?? 0),
                  volume24h: Number(ctx.dayNtlVlm),
                  szDecimals: asset.szDecimals,
                  maxLeverage: asset.maxLeverage,
                } satisfies PerpMarketSnapshot
              })
              .filter((m): m is PerpMarketSnapshot => m !== null)
              .sort((a, b) => b.volume24h - a.volume24h)

            return json(markets)
          }

          case 'candles': {
            const coin = params?.coin as string
            const windowLabel = params?.windowLabel as string
            const interval = PERP_INTERVAL_MAP[windowLabel] ?? '15m'
            const windowSecs = PERP_WINDOW_SECS[windowLabel] ?? 3600
            const now = Date.now()
            const startTime = now - windowSecs * 1000

            try {
              const result = await info.candleSnapshot({
                coin,
                interval,
                startTime,
                endTime: now,
              })

              if (!result || result.length === 0) {
                return json({ candles: [], status: 'no_data' } satisfies PerpCandlesResponse)
              }

              const candles = result.map((candle) => ({
                time: candle.t / 1000,
                value: Number(candle.c),
              }))

              return json({ candles, status: 'ok' } satisfies PerpCandlesResponse)
            } catch {
              return json({ candles: [], status: 'error' } satisfies PerpCandlesResponse)
            }
          }

          case 'account': {
            const result = await info.clearinghouseState(
              params as Parameters<typeof info.clearinghouseState>[0],
            )
            return json(result)
          }

          case 'orders': {
            const result = await info.frontendOpenOrders(
              params as Parameters<typeof info.frontendOpenOrders>[0],
            )
            return json(result)
          }

          case 'fills': {
            const result = await info.userFills(
              params as Parameters<typeof info.userFills>[0],
            )
            return json(result)
          }

          default:
            return new Response('Unknown type', { status: 400 })
        }
      },
    },
  },
})

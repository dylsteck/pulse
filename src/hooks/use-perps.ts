import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWalletClient } from 'wagmi'
import { useWallet } from '@/hooks/use-wallet'
import { MOCK_PERPS } from '@/lib/mock/perps'
import {
  armDeadManSwitch,
  batchModify as batchModifyOrders,
  cancelByCloid,
  cancelOrders,
  createLimitOrder,
  createMarketOrderForUsdSize,
  disarmDeadManSwitch,
  fetchPerpAccountState,
  fetchPerpFills,
  fetchPerpMarketsSnapshot,
  fetchPerpOpenOrders,
  isLivePerpsEnabled,
  newCloid,
  placeBatchOrders,
  placeOrder,
  type PerpMarketSnapshot,
  updateIsolatedMargin,
  updateLeverage,
} from '@/lib/hyperliquid/service'
import { assertSignerReady } from '@/lib/hyperliquid/signer'

const PERPS_QUERY_KEYS = {
  markets: ['hyperliquid', 'markets'] as const,
  account: (address: string | null) => ['hyperliquid', 'account', address] as const,
  openOrders: (address: string | null) => ['hyperliquid', 'openOrders', address] as const,
  fills: (address: string | null) => ['hyperliquid', 'fills', address] as const,
}

function toMockSnapshot(): PerpMarketSnapshot[] {
  return MOCK_PERPS.map((market, index) => ({
    id: market.id,
    assetId: index,
    coin: market.coin,
    markPx: market.markPx,
    midPx: market.markPx,
    prevDayPx: market.markPx * (1 - market.funding * 10),
    change24h: market.funding * 1000,
    funding: market.funding,
    openInterest: market.openInterest,
    premium: market.premium,
    volume24h: market.volume24h,
    szDecimals: market.szDecimals,
    maxLeverage: market.maxLeverage,
  }))
}

export function usePerpMarkets() {
  return useQuery({
    queryKey: PERPS_QUERY_KEYS.markets,
    queryFn: async () => (isLivePerpsEnabled() ? fetchPerpMarketsSnapshot() : toMockSnapshot()),
    refetchInterval: isLivePerpsEnabled() ? 7_500 : false,
  })
}

export function usePerpAccountState() {
  const wallet = useWallet()
  return useQuery({
    queryKey: PERPS_QUERY_KEYS.account(wallet.address),
    enabled: Boolean(wallet.address && isLivePerpsEnabled()),
    queryFn: async () => fetchPerpAccountState(wallet.address!),
    refetchInterval: 10_000,
  })
}

export function usePerpOpenOrders() {
  const wallet = useWallet()
  return useQuery({
    queryKey: PERPS_QUERY_KEYS.openOrders(wallet.address),
    enabled: Boolean(wallet.address && isLivePerpsEnabled()),
    queryFn: async () => fetchPerpOpenOrders(wallet.address!),
    refetchInterval: 5_000,
  })
}

export function usePerpFills() {
  const wallet = useWallet()
  return useQuery({
    queryKey: PERPS_QUERY_KEYS.fills(wallet.address),
    enabled: Boolean(wallet.address && isLivePerpsEnabled()),
    queryFn: async () => fetchPerpFills(wallet.address!),
    refetchInterval: 15_000,
  })
}

export function usePerpsTrading() {
  const wallet = useWallet()
  const { data: walletClient } = useWalletClient()

  const guardedClient = () => {
    assertSignerReady({
      connected: wallet.connected,
      address: wallet.address,
      walletClient,
    })
    return walletClient
  }

  return useMemo(
    () => ({
      async marketOrder(params: {
        market: PerpMarketSnapshot
        side: 'buy' | 'sell'
        usdSize: number
        reduceOnly?: boolean
      }) {
        const client = guardedClient()
        const cloid = newCloid()
        const order = await createMarketOrderForUsdSize({
          ...params,
          cloid,
        })
        return placeOrder({ walletClient: client, order })
      },
      async limitOrder(params: {
        market: PerpMarketSnapshot
        side: 'buy' | 'sell'
        size: number
        limitPrice: number
        reduceOnly?: boolean
      }) {
        const client = guardedClient()
        const cloid = newCloid()
        const order = await createLimitOrder({ ...params, cloid })
        return placeOrder({ walletClient: client, order })
      },
      async batchMarketOrders(
        entries: Array<{
          market: PerpMarketSnapshot
          side: 'buy' | 'sell'
          usdSize: number
          reduceOnly?: boolean
        }>,
      ) {
        const client = guardedClient()
        const orders = await Promise.all(
          entries.map((entry) =>
            createMarketOrderForUsdSize({
              ...entry,
              cloid: newCloid(),
            }),
          ),
        )
        return placeBatchOrders({ walletClient: client, orders })
      },
      async cancelByOid(params: Array<{ assetId: number; orderId: number }>) {
        const client = guardedClient()
        return cancelOrders(
          client,
          params.map((entry) => ({ a: entry.assetId, o: entry.orderId })),
        )
      },
      async cancelByClientOrderId(params: Array<{ assetId: number; cloid: `0x${string}` }>) {
        const client = guardedClient()
        return cancelByCloid(
          client,
          params.map((entry) => ({ asset: entry.assetId, cloid: entry.cloid })),
        )
      },
      async setLeverage(asset: number, leverage: number, isCross = false) {
        const client = guardedClient()
        return updateLeverage(client, { asset, leverage, isCross })
      },
      async adjustIsolatedMargin(asset: number, ntliUsd: number, isBuy = true) {
        const client = guardedClient()
        return updateIsolatedMargin(client, {
          asset,
          isBuy,
          ntli: Math.trunc(ntliUsd * 1_000_000),
        })
      },
      async batchModify(
        modifies: Array<{
          oid: number
          order: {
            a: number
            b: boolean
            p: string
            s: string
            r: boolean
            t: { limit: { tif: 'Gtc' | 'Ioc' } }
            c?: `0x${string}`
          }
        }>,
      ) {
        const client = guardedClient()
        return batchModifyOrders(client, modifies)
      },
      async armDeadManSwitch() {
        const client = guardedClient()
        return armDeadManSwitch(client)
      },
      async disarmDeadManSwitch() {
        const client = guardedClient()
        return disarmDeadManSwitch(client)
      },
    }),
    [wallet.address, wallet.connected, walletClient],
  )
}

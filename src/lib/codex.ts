import type { Token } from '@/lib/types'
import { makeRequest } from '@/lib/request'

interface CodexTokenResult {
  priceUSD: string
  change24: string
  volume24: string
  marketCap: string
  token: {
    address: string
    symbol: string
    name: string
    networkId: number
    info?: {
      imageSmallUrl?: string
    }
  }
}

const BASE_NETWORK_ID = 8453

export interface BarDataPoint {
  time: number
  value: number
}

export interface BarsResponse {
  bars: Array<BarDataPoint>
  status: string
}

/** Map our UI time-window labels to Codex resolution strings */
const RESOLUTION_MAP: Record<string, string> = {
  '15m': '1', // 1-minute bars over 15 minutes
  '1H': '1', // 1-minute bars over 1 hour
  '6H': '15', // 15-minute bars over 6 hours
  '1D': '60', // 60-minute bars over 1 day
}

const WINDOW_SECS_MAP: Record<string, number> = {
  '15m': 900,
  '1H': 3600,
  '6H': 21600,
  '1D': 86400,
}

export function buildBaseTokensQuery(
  limit: number,
  offset: number,
): Record<string, unknown> {
  return {
    query: `
      query BaseTokens($filters: TokenFilters, $limit: Int!, $offset: Int) {
        filterTokens(filters: $filters, limit: $limit, offset: $offset) {
          results {
            priceUSD
            change24
            volume24
            marketCap
            token {
              address
              symbol
              name
              networkId
              info {
                imageSmallUrl
              }
            }
          }
        }
      }
    `,
    variables: {
      limit,
      offset,
      filters: { network: [BASE_NETWORK_ID] },
    },
  }
}

export function buildTokenByAddressQuery(
  address: string,
): Record<string, unknown> {
  return {
    query: `
      query TokenByAddress($input: TokenInput!, $priceInputs: [GetPriceInput!]!) {
        token(input: $input) {
          address
          symbol
          name
          networkId
          info {
            imageSmallUrl
          }
        }
        getTokenPrices(inputs: $priceInputs) {
          address
          priceUsd
        }
      }
    `,
    variables: {
      input: { address, networkId: BASE_NETWORK_ID },
      priceInputs: [{ address, networkId: BASE_NETWORK_ID }],
    },
  }
}

export function buildBarsQuery(
  address: string,
  windowLabel: string,
): Record<string, unknown> {
  const resolution = RESOLUTION_MAP[windowLabel] ?? '15'
  const windowSecs = WINDOW_SECS_MAP[windowLabel] ?? 3600
  const now = Math.floor(Date.now() / 1000)
  const from = now - windowSecs

  return {
    query: `
      query GetTokenBars($symbol: String!, $from: Int!, $to: Int!, $resolution: String!) {
        getTokenBars(
          symbol: $symbol
          from: $from
          to: $to
          resolution: $resolution
          removeEmptyBars: true
        ) {
          c
          t
          s
        }
      }
    `,
    variables: {
      symbol: `${BASE_NETWORK_ID}:${address}`,
      from,
      to: now,
      resolution,
    },
  }
}

export function transformBaseTokens(json: {
  errors?: Array<{ message: string }>
  data?: {
    filterTokens?: {
      results?: Array<CodexTokenResult>
    }
  }
}): Array<Token> {
  if (json.errors?.length) {
    throw new Error(
      `Codex query failed: ${json.errors[0]?.message ?? 'Unknown error'}`,
    )
  }

  const results = json.data?.filterTokens?.results ?? []
  const now = Date.now() / 1000

  return results
    .filter(
      (item) =>
        item?.token?.address && item.token.networkId === BASE_NETWORK_ID,
    )
    .map((item) => {
      const price = Number(item.priceUSD || 0)
      const change24Decimal = Number(item.change24 || 0)
      return {
        id: item.token.address.toLowerCase(),
        name: item.token.name || item.token.symbol,
        symbol: item.token.symbol,
        address: item.token.address.toLowerCase(),
        price,
        change24h: change24Decimal * 100,
        volume24h: Number(item.volume24 || 0),
        marketCap: Number(item.marketCap || 0),
        priceHistory: [{ time: now, value: price }],
        imageUrl: item.token.info?.imageSmallUrl ?? undefined,
      } satisfies Token
    })
}

export function transformTokenByAddress(json: {
  errors?: Array<{ message: string }>
  data?: {
    token?: {
      address: string
      symbol: string
      name: string
      networkId: number
      info?: { imageSmallUrl?: string }
    }
    getTokenPrices?: Array<{ address: string; priceUsd: number }>
  }
}): Omit<Token, 'change24h' | 'volume24h' | 'marketCap'> & {
  change24h: number
  volume24h: number
  marketCap: number
} | null {
  if (json.errors?.length) {
    throw new Error(
      `Codex query failed: ${json.errors[0]?.message ?? 'Unknown error'}`,
    )
  }

  const tokenData = json.data?.token
  if (!tokenData?.address) return null

  const priceEntry = json.data?.getTokenPrices?.[0]
  const price = priceEntry?.priceUsd ?? 0
  const now = Date.now() / 1000

  return {
    id: tokenData.address.toLowerCase(),
    name: tokenData.name || tokenData.symbol,
    symbol: tokenData.symbol,
    address: tokenData.address.toLowerCase(),
    price,
    change24h: 0,
    volume24h: 0,
    marketCap: 0,
    priceHistory: [{ time: now, value: price }],
    imageUrl: tokenData.info?.imageSmallUrl ?? undefined,
  }
}

export function transformBars(json: {
  errors?: Array<{ message: string }>
  data?: {
    getTokenBars?: {
      c: Array<number> | null
      t: Array<number> | null
      s: string
    }
  }
}): BarsResponse {
  if (json.errors?.length) {
    throw new Error(
      `Codex bars query failed: ${json.errors[0]?.message ?? 'Unknown error'}`,
    )
  }

  const result = json.data?.getTokenBars
  if (!result || result.s !== 'ok' || !result.c?.length || !result.t?.length) {
    return { bars: [], status: result?.s ?? 'no_data' }
  }

  const bars: Array<BarDataPoint> = result.t.map((timestamp, i) => ({
    time: timestamp,
    value: result.c![i] ?? 0,
  }))

  return { bars, status: 'ok' }
}

const CODEX_POST_OPTIONS = (body: Record<string, unknown>): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function fetchCodexBaseTokens(
  limit = 50,
  offset = 0,
): Promise<Array<Token>> {
  return transformBaseTokens(
    await makeRequest('/api/codex', CODEX_POST_OPTIONS(buildBaseTokensQuery(limit, offset))),
  )
}

export async function fetchCodexTokenByAddress(
  address: string,
): Promise<Token | null> {
  const addr = address.toLowerCase()
  const tokenBase = transformTokenByAddress(
    await makeRequest('/api/codex', CODEX_POST_OPTIONS(buildTokenByAddressQuery(addr))),
  )
  if (!tokenBase) return null

  // Fetch bars to compute change24h
  let change24h = 0
  try {
    const bars = await fetchCodexBars(addr, '1D')
    if (bars.bars.length >= 2) {
      const firstPrice = bars.bars[0]!.value
      const lastPrice = bars.bars.at(-1)!.value
      if (firstPrice > 0) {
        change24h = ((lastPrice - firstPrice) / firstPrice) * 100
      }
    }
  } catch {
    /* bars unavailable */
  }

  return { ...tokenBase, change24h } satisfies Token
}

export async function fetchCodexBars(
  address: string,
  windowLabel: string,
): Promise<BarsResponse> {
  return transformBars(
    await makeRequest('/api/codex', CODEX_POST_OPTIONS(buildBarsQuery(address, windowLabel))),
  )
}

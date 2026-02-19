import { createServerFn } from '@tanstack/react-start'
import type { Token } from '@/lib/types'

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

const fetchCodexBaseTokensServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { limit: number; offset: number }) => input)
  .handler(async ({ data }): Promise<Token[]> => {
    if (!process.env.CODEX_API_KEY) {
      throw new Error('Missing CODEX_API_KEY')
    }

    const query = `
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
    `

    const res = await fetch('https://graph.codex.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.CODEX_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: {
          limit: data.limit,
          offset: data.offset,
          filters: {
            network: [BASE_NETWORK_ID],
          },
        },
      }),
    })

    if (!res.ok) {
      throw new Error(`Codex API error: ${res.status}`)
    }

    const json = (await res.json()) as {
      errors?: Array<{ message: string }>
      data?: {
        filterTokens?: {
          results?: CodexTokenResult[]
        }
      }
    }

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
  })

export async function fetchCodexBaseTokens(
  limit = 50,
  offset = 0,
): Promise<Token[]> {
  return fetchCodexBaseTokensServer({ data: { limit, offset } })
}

const fetchCodexTokenByAddressServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { address: string }) => input)
  .handler(async ({ data }): Promise<Token | null> => {
    if (!process.env.CODEX_API_KEY) {
      throw new Error('Missing CODEX_API_KEY')
    }

    const query = `
      query TokenByAddress($filters: TokenFilters, $limit: Int!) {
        filterTokens(filters: $filters, limit: $limit) {
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
    `

    const res = await fetch('https://graph.codex.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.CODEX_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: {
          limit: 1,
          filters: {
            network: [BASE_NETWORK_ID],
            tokens: [`${BASE_NETWORK_ID}:${data.address}`],
          },
        },
      }),
    })

    if (!res.ok) {
      throw new Error(`Codex API error: ${res.status}`)
    }

    const json = (await res.json()) as {
      errors?: Array<{ message: string }>
      data?: {
        filterTokens?: {
          results?: CodexTokenResult[]
        }
      }
    }

    if (json.errors?.length) {
      throw new Error(
        `Codex query failed: ${json.errors[0]?.message ?? 'Unknown error'}`,
      )
    }

    const result = json.data?.filterTokens?.results?.[0]
    if (!result?.token?.address || result.token.networkId !== BASE_NETWORK_ID) {
      return null
    }

    const price = Number(result.priceUSD || 0)
    const change24Decimal = Number(result.change24 || 0)
    const now = Date.now() / 1000

    return {
      id: result.token.address.toLowerCase(),
      name: result.token.name || result.token.symbol,
      symbol: result.token.symbol,
      address: result.token.address.toLowerCase(),
      price,
      change24h: change24Decimal * 100,
      volume24h: Number(result.volume24 || 0),
      marketCap: Number(result.marketCap || 0),
      priceHistory: [{ time: now, value: price }],
      imageUrl: result.token.info?.imageSmallUrl ?? undefined,
    } satisfies Token
  })

export async function fetchCodexTokenByAddress(
  address: string,
): Promise<Token | null> {
  return fetchCodexTokenByAddressServer({ data: { address } })
}

// ── Historical bar data (OHLC) ──────────────────────────────────────────

export interface BarDataPoint {
  time: number
  value: number
}

export interface BarsResponse {
  bars: BarDataPoint[]
  status: string
}

/** Map our UI time-window labels to Codex resolution strings */
const RESOLUTION_MAP: Record<string, string> = {
  '15m': '1', // 1-minute bars over 15 minutes
  '1H': '1', // 1-minute bars over 1 hour
  '6H': '15', // 15-minute bars over 6 hours
  '1D': '60', // 60-minute bars over 1 day
}

const fetchCodexBarsServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { address: string; windowLabel: string }) => input)
  .handler(async ({ data }): Promise<BarsResponse> => {
    if (!process.env.CODEX_API_KEY) {
      throw new Error('Missing CODEX_API_KEY')
    }

    const resolution = RESOLUTION_MAP[data.windowLabel] ?? '15'
    const windowSecsMap: Record<string, number> = {
      '15m': 900,
      '1H': 3600,
      '6H': 21600,
      '1D': 86400,
    }
    const windowSecs = windowSecsMap[data.windowLabel] ?? 3600
    const now = Math.floor(Date.now() / 1000)
    const from = now - windowSecs

    const query = `
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
    `

    const res = await fetch('https://graph.codex.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.CODEX_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: {
          symbol: `${data.address}:${BASE_NETWORK_ID}`,
          from,
          to: now,
          resolution,
        },
      }),
    })

    if (!res.ok) {
      throw new Error(`Codex bars API error: ${res.status}`)
    }

    const json = (await res.json()) as {
      errors?: Array<{ message: string }>
      data?: {
        getTokenBars?: {
          c: number[] | null
          t: number[] | null
          s: string
        }
      }
    }

    if (json.errors?.length) {
      throw new Error(
        `Codex bars query failed: ${json.errors[0]?.message ?? 'Unknown error'}`,
      )
    }

    const result = json.data?.getTokenBars
    if (
      !result ||
      result.s !== 'ok' ||
      !result.c?.length ||
      !result.t?.length
    ) {
      return { bars: [], status: result?.s ?? 'no_data' }
    }

    const bars: BarDataPoint[] = result.t.map((timestamp, i) => ({
      time: timestamp,
      value: result.c![i] ?? 0,
    }))

    return { bars, status: 'ok' }
  })

export async function fetchCodexBars(
  address: string,
  windowLabel: string,
): Promise<BarsResponse> {
  return fetchCodexBarsServer({ data: { address, windowLabel } })
}

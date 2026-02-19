import { createServerFn } from '@tanstack/react-start'
import type { Token } from '@/lib/mock/tokens'

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
  }
}

const BASE_NETWORK_ID = 8453

const fetchCodexBaseTokensServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { limit: number }) => input)
  .handler(async ({ data }): Promise<Token[]> => {
    if (!process.env.CODEX_API_KEY) {
      throw new Error('Missing CODEX_API_KEY')
    }

    const query = `
      query BaseTokens($filters: TokenFilters, $limit: Int!) {
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
      throw new Error(`Codex query failed: ${json.errors[0]?.message ?? 'Unknown error'}`)
    }

    const results = json.data?.filterTokens?.results ?? []
    const now = Date.now() / 1000

    return results
      .filter((item) => item?.token?.address && item.token.networkId === BASE_NETWORK_ID)
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
        } satisfies Token
      })
  })

export async function fetchCodexBaseTokens(limit = 40): Promise<Token[]> {
  return fetchCodexBaseTokensServer({ data: { limit } })
}

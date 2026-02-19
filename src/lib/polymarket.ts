import { createServerFn } from '@tanstack/react-start'
import type { Market } from '@/lib/mock/markets'

interface PolymarketMarket {
  outcomes?: string
  outcomePrices?: string
}

interface PolymarketEvent {
  id: string
  title: string
  volume24hr?: number
  volume?: number
  endDate?: string
  markets?: PolymarketMarket[]
}

function parseOutcomePrices(value: string | undefined): [number, number] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as string[]
    if (!Array.isArray(parsed) || parsed.length < 2) return null
    const yes = Number(parsed[0])
    const no = Number(parsed[1])
    if (!Number.isFinite(yes) || !Number.isFinite(no)) return null
    return [yes, no]
  } catch {
    return null
  }
}

const fetchPolymarketEventsServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { limit: number }) => input)
  .handler(async ({ data }): Promise<Market[]> => {
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false',
      order: 'volume_24hr',
      ascending: 'false',
      limit: String(data.limit),
      offset: '0',
    })
    const res = await fetch(`https://gamma-api.polymarket.com/events?${params.toString()}`)
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`)
    }
    const json = (await res.json()) as PolymarketEvent[]
    const now = Date.now() / 1000

    return json
      .map((event): Market | null => {
        const firstMarket = event.markets?.[0]
        const prices = parseOutcomePrices(firstMarket?.outcomePrices)
        if (!prices) return null

        const yesPercent = Math.max(0, Math.min(100, prices[0] * 100))
        const noPercent = Math.max(0, Math.min(100, prices[1] * 100))
        return {
          id: String(event.id),
          title: event.title,
          yesPercent,
          noPercent,
          volume: Number(event.volume24hr ?? event.volume ?? 0),
          expiry: event.endDate ?? new Date().toISOString(),
          priceHistory: [{ time: now, value: yesPercent }],
        }
      })
      .filter((market): market is Market => market !== null)
  })

export async function fetchPolymarketEvents(limit = 40): Promise<Market[]> {
  return fetchPolymarketEventsServer({ data: { limit } })
}

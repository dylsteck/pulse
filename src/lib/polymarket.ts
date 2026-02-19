import { createServerFn } from '@tanstack/react-start'
import type { Market, MarketOutcome } from '@/lib/types'

interface PolymarketMarket {
  question?: string
  outcomes?: string
  outcomePrices?: string
  groupItemTitle?: string
}

interface PolymarketEvent {
  id: string
  title: string
  volume24hr?: number
  volume?: number
  endDate?: string
  image?: string
  markets?: PolymarketMarket[]
}

function parseOutcomePrices(
  value: string | undefined,
): [number, number] | null {
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

function parseOutcomeNames(value: string | undefined): string[] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as string[]
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function shortenOutcomeName(question: string): string {
  const subjectMatch = question.match(
    /^Will\s+([A-Z][a-zA-Z.''\-]+(?:\s+[A-Z][a-zA-Z.''\-]+)*)\s+(?:win|become|get|be\s)/i,
  )
  if (subjectMatch) return subjectMatch[1].trim()

  const haveMatch = question.match(
    /^Will\s+([A-Z][a-zA-Z.''\-]+(?:\s+[A-Z][a-zA-Z.''\-]*)*)\s+have\s/i,
  )
  if (haveMatch) return haveMatch[1].trim()

  const tweetMatch = question.match(/post\s+(\d+[-–]\d+)/i)
  if (tweetMatch) return tweetMatch[1]

  const rateMatch = question.match(
    /(?:Fed|Federal Reserve)\s+(increase|decrease|cut|raise|hold|pause)/i,
  )
  if (rateMatch) {
    const action = rateMatch[1]
    return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()
  }

  let result = question
    .replace(/^(Will|Will the|Which|Does|Do)\s+/i, '')
    .replace(/\?$/, '')
    .trim()

  if (result.length > 25) {
    const words = result.split(/\s+/).slice(0, 3)
    result = words.join(' ')
    if (result.length > 25) result = result.substring(0, 22) + '...'
  }

  return result || question
}

function extractOutcomes(markets: PolymarketMarket[]): MarketOutcome[] {
  if (markets.length <= 1) return []

  const outcomes: MarketOutcome[] = []
  for (const m of markets) {
    const names = parseOutcomeNames(m.outcomes)
    const prices = parseOutcomePrices(m.outcomePrices)
    if (!names || !prices) continue
    const percent =
      Math.round(Math.max(0, Math.min(100, prices[0] * 100)) * 100) / 100
    outcomes.push({
      name:
        m.groupItemTitle ??
        shortenOutcomeName(m.question ?? names[0] ?? 'Unknown'),
      percent,
    })
  }

  return outcomes.sort((a, b) => b.percent - a.percent).slice(0, 2)
}

export interface PolymarketPage {
  items: Market[]
  nextOffset: number | null
}

const fetchPolymarketEventsServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { limit: number; offset: number }) => input)
  .handler(async ({ data }): Promise<PolymarketPage> => {
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false',
      order: 'volume24hr',
      ascending: 'false',
      limit: String(data.limit),
      offset: String(data.offset),
    })
    const res = await fetch(
      `https://gamma-api.polymarket.com/events?${params.toString()}`,
    )
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`)
    }
    const json = (await res.json()) as PolymarketEvent[]
    const now = Date.now() / 1000

    const markets = json
      .map((event): Market | null => {
        const firstMarket = event.markets?.[0]
        const prices = parseOutcomePrices(firstMarket?.outcomePrices)
        if (!prices) return null

        const yesPercent =
          Math.round(Math.max(0, Math.min(100, prices[0] * 100)) * 100) / 100
        const noPercent =
          Math.round(Math.max(0, Math.min(100, prices[1] * 100)) * 100) / 100
        const outcomes = extractOutcomes(event.markets ?? [])
        return {
          id: String(event.id),
          title: event.title,
          yesPercent,
          noPercent,
          volume: Number(event.volume24hr ?? event.volume ?? 0),
          expiry: event.endDate ?? new Date().toISOString(),
          priceHistory: [{ time: now, value: yesPercent }],
          imageUrl: event.image,
          outcomes: outcomes.length > 0 ? outcomes : undefined,
        }
      })
      .filter((market): market is Market => market !== null)

    const nextOffset =
      json.length >= data.limit ? data.offset + data.limit : null
    return { items: markets, nextOffset }
  })

export async function fetchPolymarketEvents(
  limit = 40,
  offset = 0,
): Promise<PolymarketPage> {
  return fetchPolymarketEventsServer({ data: { limit, offset } })
}

const fetchPolymarketEventByIdServer = createServerFn({ method: 'POST' })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<Market | null> => {
    const res = await fetch(
      `https://gamma-api.polymarket.com/events/${data.id}`,
    )
    if (!res.ok) return null
    const event = (await res.json()) as PolymarketEvent
    const firstMarket = event.markets?.[0]
    const prices = parseOutcomePrices(firstMarket?.outcomePrices)
    if (!prices) return null
    const now = Date.now() / 1000
    const yesPercent =
      Math.round(Math.max(0, Math.min(100, prices[0] * 100)) * 100) / 100
    const noPercent =
      Math.round(Math.max(0, Math.min(100, prices[1] * 100)) * 100) / 100
    const outcomes = extractOutcomes(event.markets ?? [])

    return {
      id: String(event.id),
      title: event.title,
      yesPercent,
      noPercent,
      volume: Number(event.volume24hr ?? event.volume ?? 0),
      expiry: event.endDate ?? new Date().toISOString(),
      priceHistory: [{ time: now, value: yesPercent }],
      imageUrl: event.image,
      outcomes: outcomes.length > 0 ? outcomes : undefined,
    }
  })

export async function fetchPolymarketEventById(
  id: string,
): Promise<Market | null> {
  return fetchPolymarketEventByIdServer({ data: { id } })
}

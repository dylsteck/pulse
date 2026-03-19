import type { Market, MarketOutcome } from '@/lib/types'
import { makeRequest } from '@/lib/request'

interface PolymarketMarket {
  question?: string
  outcomes?: string
  outcomePrices?: string
  groupItemTitle?: string
  clobTokenIds?: string
}

interface PolymarketEvent {
  id: string
  title: string
  volume24hr?: number
  volume?: number
  endDate?: string
  image?: string
  markets?: Array<PolymarketMarket>
}

export interface PolymarketPage {
  items: Array<Market>
  nextOffset: number | null
}

const CLOB_INTERVAL_MAP: Record<string, string> = {
  '15m': '1h',
  '1H': '6h',
  '6H': '1d',
  '1D': '1w',
}

function parseOutcomePrices(
  value: string | undefined,
): [number, number] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Array<string>
    if (!Array.isArray(parsed) || parsed.length < 2) return null
    const yes = Number(parsed[0])
    const no = Number(parsed[1])
    if (!Number.isFinite(yes) || !Number.isFinite(no)) return null
    return [yes, no]
  } catch {
    return null
  }
}

function parseClobTokenIds(value: string | undefined): Array<string> | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Array<string>
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function parseOutcomeNames(value: string | undefined): Array<string> | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Array<string>
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

function extractOutcomes(
  markets: Array<PolymarketMarket>,
): Array<MarketOutcome> {
  if (markets.length <= 1) return []

  const outcomes: Array<MarketOutcome> = []
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

export function transformPolymarketEvents(
  json: Array<PolymarketEvent>,
  limit: number,
  offset: number,
): PolymarketPage {
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
      const clobIds = parseClobTokenIds(firstMarket?.clobTokenIds)
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
        clobTokenId: clobIds?.[0],
      }
    })
    .filter((market): market is Market => market !== null)

  const nextOffset = json.length >= limit ? offset + limit : null
  return { items: markets, nextOffset }
}

export function transformPolymarketEventById(
  json: PolymarketEvent,
): Market | null {
  const firstMarket = json.markets?.[0]
  const prices = parseOutcomePrices(firstMarket?.outcomePrices)
  if (!prices) return null
  const now = Date.now() / 1000
  const yesPercent =
    Math.round(Math.max(0, Math.min(100, prices[0] * 100)) * 100) / 100
  const noPercent =
    Math.round(Math.max(0, Math.min(100, prices[1] * 100)) * 100) / 100
  const outcomes = extractOutcomes(json.markets ?? [])
  const clobIds = parseClobTokenIds(firstMarket?.clobTokenIds)

  return {
    id: String(json.id),
    title: json.title,
    yesPercent,
    noPercent,
    volume: Number(json.volume24hr ?? json.volume ?? 0),
    expiry: json.endDate ?? new Date().toISOString(),
    priceHistory: [{ time: now, value: yesPercent }],
    imageUrl: json.image,
    outcomes: outcomes.length > 0 ? outcomes : undefined,
    clobTokenId: clobIds?.[0],
  }
}

export function transformPriceHistory(json: {
  history?: Array<{ t: number; p: number }>
}): Array<{ time: number; value: number }> {
  if (!json.history || json.history.length === 0) return []
  return json.history.map((pt) => ({
    time: pt.t,
    value: Math.round(pt.p * 100 * 100) / 100,
  }))
}

export async function fetchPolymarketEvents(
  limit = 40,
  offset = 0,
): Promise<PolymarketPage> {
  const params = new URLSearchParams({
    active: 'true',
    closed: 'false',
    order: 'volume24hr',
    ascending: 'false',
    limit: String(limit),
    offset: String(offset),
  })
  const data = await makeRequest<Array<PolymarketEvent>>(
    `/api/polymarket/events?${params.toString()}`,
  )
  return transformPolymarketEvents(data, limit, offset)
}

export async function fetchPolymarketEventById(
  id: string,
): Promise<Market | null> {
  try {
    const data = await makeRequest<PolymarketEvent>(
      `/api/polymarket/events?singleId=${encodeURIComponent(id)}`,
    )
    return transformPolymarketEventById(data)
  } catch {
    return null
  }
}

export async function fetchPolymarketPriceHistory(
  clobTokenId: string,
  windowLabel: string,
): Promise<Array<{ time: number; value: number }>> {
  const interval = CLOB_INTERVAL_MAP[windowLabel] ?? '1d'
  const params = new URLSearchParams({
    market: clobTokenId,
    interval,
    fidelity: '1',
  })
  try {
    return transformPriceHistory(
      await makeRequest<{ history?: Array<{ t: number; p: number }> }>(
        `/api/polymarket/history?${params.toString()}`,
      ),
    )
  } catch {
    return []
  }
}

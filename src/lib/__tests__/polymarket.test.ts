import { describe, expect, test } from 'bun:test'
import {
  hasAnyPriceHistoryRecord,
  transformBatchPriceHistory,
  transformPolymarketEvents,
  transformPriceHistory,
} from '@/lib/polymarket'

describe('transformPolymarketEvents', () => {
  test('transforms events with outcome prices', () => {
    const json = [
      {
        id: '1',
        title: 'Will X win?',
        volume24hr: 100000,
        endDate: '2025-12-31T00:00:00Z',
        image: 'https://example.com/img.png',
        markets: [
          {
            outcomePrices: '["0.65","0.35"]',
            clobTokenIds: '["123","456"]',
          },
        ],
      },
    ]
    const result = transformPolymarketEvents(json, 10, 0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('1')
    expect(result.items[0]?.title).toBe('Will X win?')
    expect(result.items[0]?.yesPercent).toBe(65)
    expect(result.items[0]?.noPercent).toBe(35)
    expect(result.items[0]?.volume).toBe(100000)
    expect(result.items[0]?.imageUrl).toBe('https://example.com/img.png')
    expect(result.items[0]?.clobTokenId).toBe('123')
    expect(result.items[0]?.noClobTokenId).toBe('456')
    expect(result.nextOffset).toBeNull()
  })

  test('returns nextOffset when limit reached', () => {
    const json = [
      {
        id: '1',
        title: 'Event 1',
        markets: [{ outcomePrices: '["0.5","0.5"]' }],
      },
      {
        id: '2',
        title: 'Event 2',
        markets: [{ outcomePrices: '["0.6","0.4"]' }],
      },
    ]
    const result = transformPolymarketEvents(json, 2, 0)
    expect(result.items).toHaveLength(2)
    expect(result.nextOffset).toBe(2)
  })

  test('filters out events without valid prices', () => {
    const json = [
      {
        id: '1',
        title: 'Valid',
        markets: [{ outcomePrices: '["0.5","0.5"]' }],
      },
      { id: '2', title: 'No prices', markets: [{}] },
    ]
    const result = transformPolymarketEvents(json, 10, 0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('1')
  })
})

describe('transformPriceHistory', () => {
  test('transforms history array', () => {
    const json = {
      history: [
        { t: 1000, p: 0.5 },
        { t: 2000, p: 0.55 },
      ],
    }
    const result = transformPriceHistory(json)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ time: 1000, value: 50 })
    expect(result[1]).toEqual({ time: 2000, value: 55 })
  })

  test('returns empty array for empty history', () => {
    expect(transformPriceHistory({})).toEqual([])
    expect(transformPriceHistory({ history: [] })).toEqual([])
  })
})

describe('transformBatchPriceHistory', () => {
  test('maps token ids to percent series', () => {
    const result = transformBatchPriceHistory({
      history: {
        '111': [{ t: 1, p: 0.5 }],
        '222': [
          { t: 1, p: 0.2 },
          { t: 2, p: 0.25 },
        ],
      },
    })
    expect(result['111']).toEqual([{ time: 1, value: 50 }])
    expect(result['222']).toEqual([
      { time: 1, value: 20 },
      { time: 2, value: 25 },
    ])
  })

  test('returns empty object for missing history', () => {
    expect(transformBatchPriceHistory({})).toEqual({})
    expect(transformBatchPriceHistory({ history: undefined })).toEqual({})
  })
})

describe('hasAnyPriceHistoryRecord', () => {
  test('is true when any series has points', () => {
    expect(
      hasAnyPriceHistoryRecord({ a: [{ time: 1, value: 1 }], b: [] }),
    ).toBe(true)
  })

  test('is false when empty or all empty', () => {
    expect(hasAnyPriceHistoryRecord({})).toBe(false)
    expect(hasAnyPriceHistoryRecord({ a: [], b: [] })).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { parseCancelStatuses, parseOrderStatuses } from '@/lib/hyperliquid/status'

describe('status parsers', () => {
  it('parses mixed order statuses', () => {
    const parsed = parseOrderStatuses({
      status: 'ok',
      response: {
        type: 'order',
        data: {
          statuses: [
            { resting: { oid: 1, cloid: '0x1234567890abcdef1234567890abcdef' } },
            { filled: { oid: 2, avgPx: '100', totalSz: '0.1' } },
            { error: 'Order too small.' },
            'waitingForFill',
          ],
        },
      },
    } as any)

    expect(parsed[0]?.kind).toBe('resting')
    expect(parsed[1]?.kind).toBe('filled')
    expect(parsed[2]?.kind).toBe('error')
    expect(parsed[3]?.kind).toBe('pending')
  })

  it('parses cancel statuses', () => {
    const parsed = parseCancelStatuses({
      status: 'ok',
      response: {
        type: 'cancel',
        data: {
          statuses: ['success', { error: 'unknown order' }],
        },
      },
    } as any)

    expect(parsed).toEqual([{ kind: 'ok' }, { kind: 'error', error: 'unknown order' }])
  })
})

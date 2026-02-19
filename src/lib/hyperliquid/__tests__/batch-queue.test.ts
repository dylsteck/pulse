import { describe, expect, it, vi } from 'vitest'
import { OrderBatchQueue } from '@/lib/hyperliquid/batch-queue'

describe('OrderBatchQueue', () => {
  it('flushes queued cancel requests as one cancel call', async () => {
    const exchange = {
      order: vi.fn(),
      cancel: vi.fn().mockResolvedValue({
        status: 'ok',
        response: { type: 'cancel', data: { statuses: ['success', 'success'] } },
      }),
    } as any

    const queue = new OrderBatchQueue(exchange, 1)
    await Promise.all([
      queue.enqueueCancel({ cancels: [{ a: 0, o: 1 }] }),
      queue.enqueueCancel({ cancels: [{ a: 0, o: 2 }] }),
    ])

    expect(exchange.cancel).toHaveBeenCalledTimes(1)
    expect(exchange.cancel).toHaveBeenCalledWith({
      cancels: [
        { a: 0, o: 1 },
        { a: 0, o: 2 },
      ],
    })
  })
})

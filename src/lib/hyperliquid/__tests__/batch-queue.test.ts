import { describe, expect, mock, test } from 'bun:test'
import { OrderBatchQueue } from '@/lib/hyperliquid/batch-queue'

describe('OrderBatchQueue', () => {
  test('flushes queued cancel requests as one cancel call', async () => {
    const exchange = {
      order: mock(() => undefined),
      cancel: mock(() =>
        Promise.resolve({
          status: 'ok',
          response: {
            type: 'cancel',
            data: { statuses: ['success', 'success'] },
          },
        }),
      ),
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

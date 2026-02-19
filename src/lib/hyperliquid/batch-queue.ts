import type { CancelSuccessResponse, ExchangeClient, OrderSuccessResponse } from '@nktkas/hyperliquid'
import type { OrderParameters } from '@nktkas/hyperliquid'

type QueueTask =
  | {
      kind: 'order'
      params: OrderParameters
      resolve: (result: OrderSuccessResponse) => void
      reject: (error: unknown) => void
    }
  | {
      kind: 'cancel'
      params: { cancels: Array<{ a: number; o: number }> }
      resolve: (result: CancelSuccessResponse) => void
      reject: (error: unknown) => void
    }

export class OrderBatchQueue {
  private tasks: QueueTask[] = []
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private readonly exchange: ExchangeClient,
    private readonly flushMs = 100,
  ) {}

  enqueueOrder(params: OrderParameters): Promise<OrderSuccessResponse> {
    return new Promise((resolve, reject) => {
      this.tasks.push({ kind: 'order', params, resolve, reject })
      this.scheduleFlush()
    })
  }

  enqueueCancel(params: { cancels: Array<{ a: number; o: number }> }): Promise<CancelSuccessResponse> {
    return new Promise((resolve, reject) => {
      this.tasks.push({ kind: 'cancel', params, resolve, reject })
      this.scheduleFlush()
    })
  }

  private scheduleFlush() {
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      void this.flush()
    }, this.flushMs)
  }

  async flush(): Promise<void> {
    const pending = this.tasks.splice(0, this.tasks.length)
    if (pending.length === 0) return

    const orders = pending.filter((task): task is Extract<QueueTask, { kind: 'order' }> => task.kind === 'order')
    const cancels = pending.filter((task): task is Extract<QueueTask, { kind: 'cancel' }> => task.kind === 'cancel')

    if (orders.length > 0) {
      for (const task of orders) {
        try {
          const result = await this.exchange.order(task.params)
          task.resolve(result)
        } catch (error) {
          task.reject(error)
        }
      }
    }

    if (cancels.length > 0) {
      const merged = cancels.flatMap((task) => task.params.cancels)
      try {
        const result = await this.exchange.cancel({ cancels: merged })
        for (const task of cancels) task.resolve(result)
      } catch (error) {
        for (const task of cancels) task.reject(error)
      }
    }
  }
}

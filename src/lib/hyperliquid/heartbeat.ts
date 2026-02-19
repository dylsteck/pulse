import type { ExchangeClient } from '@nktkas/hyperliquid'

export interface HeartbeatOptions {
  intervalMs?: number
  cancelAfterMs?: number
}

export class ScheduleCancelHeartbeat {
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly intervalMs: number
  private readonly cancelAfterMs: number

  constructor(
    private readonly exchange: ExchangeClient,
    options: HeartbeatOptions = {},
  ) {
    this.intervalMs = options.intervalMs ?? 30_000
    this.cancelAfterMs = options.cancelAfterMs ?? 60_000
  }

  async arm(): Promise<void> {
    await this.beat()
    this.timer = setInterval(() => {
      void this.beat()
    }, this.intervalMs)
  }

  async disarm(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    await this.exchange.scheduleCancel({})
  }

  async beat(): Promise<void> {
    await this.exchange.scheduleCancel({
      time: Date.now() + this.cancelAfterMs,
    })
  }
}

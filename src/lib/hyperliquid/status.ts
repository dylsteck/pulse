import type { CancelSuccessResponse, OrderSuccessResponse } from '@nktkas/hyperliquid'

export type ParsedOrderStatus =
  | { kind: 'resting'; oid: number; cloid?: `0x${string}` }
  | { kind: 'filled'; oid: number; avgPx: string; totalSz: string; cloid?: `0x${string}` }
  | { kind: 'error'; error: string }
  | { kind: 'pending'; state: 'waitingForFill' | 'waitingForTrigger' }

export function parseOrderStatuses(response: OrderSuccessResponse): ParsedOrderStatus[] {
  return response.response.data.statuses.map((status) => {
    if (status === 'waitingForFill' || status === 'waitingForTrigger') {
      return { kind: 'pending', state: status }
    }
    if ('resting' in status) {
      return { kind: 'resting', oid: status.resting.oid, cloid: status.resting.cloid }
    }
    if ('filled' in status) {
      return {
        kind: 'filled',
        oid: status.filled.oid,
        avgPx: status.filled.avgPx,
        totalSz: status.filled.totalSz,
        cloid: status.filled.cloid,
      }
    }
    return { kind: 'error', error: status.error }
  })
}

export type ParsedCancelStatus = { kind: 'ok' } | { kind: 'error'; error: string }

export function parseCancelStatuses(response: CancelSuccessResponse): ParsedCancelStatus[] {
  return response.response.data.statuses.map((status) =>
    status === 'success' ? { kind: 'ok' } : { kind: 'error', error: status.error },
  )
}

/**
 * CLOB interval mapping for Pulse timeframe labels (aligned with GET /prices-history).
 * @see https://docs.polymarket.com/api-reference/markets/get-prices-history
 */

export const CLOB_WINDOW_LABEL_TO_INTERVAL: Record<string, string> = {
  '1h': '6h',
  '6h': '1d',
  '1d': '1w',
  '1w': '1m',
  '1m': 'max',
  'all': 'max',
}

export const CLOB_DEFAULT_INTERVAL = '1d'

/** Fidelity in minutes (matches existing single-token history requests). */
export const CLOB_FIDELITY_MINUTES = 1

const VALID_LABELS = new Set(Object.keys(CLOB_WINDOW_LABEL_TO_INTERVAL))

export function getClobIntervalForWindowLabel(windowLabel: string): string {
  const key = windowLabel.toLowerCase()
  return CLOB_WINDOW_LABEL_TO_INTERVAL[key] ?? CLOB_DEFAULT_INTERVAL
}

export function isValidPolymarketWindowLabel(
  label: string | null | undefined,
): boolean {
  if (label == null || label === '') return false
  return VALID_LABELS.has(label.toLowerCase())
}

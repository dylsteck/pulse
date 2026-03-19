const KNOWN_ERROR_MAP: Array<{ match: RegExp; message: string }> = [
  {
    match: /tick size|precision|divisible/i,
    message: 'Invalid price precision for this market.',
  },
  {
    match: /too small|min notional|minimum/i,
    message: 'Order size is below the minimum notional.',
  },
  {
    match: /insufficient margin|insufficient balance/i,
    message: 'Insufficient margin for this trade.',
  },
  {
    match: /immediately liquidate|liquidat/i,
    message: 'This order would put the position at liquidation risk.',
  },
  {
    match: /does not exist|api wallet|user or api wallet/i,
    message: 'Signer is not recognized by Hyperliquid.',
  },
]

export function normalizeHyperliquidError(error: unknown): string {
  const raw =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : 'Unknown Hyperliquid error'

  const match = KNOWN_ERROR_MAP.find((entry) => entry.match.test(raw))
  return match ? `${match.message} (${raw})` : raw
}

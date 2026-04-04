import { formatUnits } from 'viem'

export function shortWalletAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function formatUsdcBalance(raw: bigint | undefined): string {
  if (raw == null) return '—'
  return `$${parseFloat(formatUnits(raw, 6)).toFixed(2)}`
}

/** Sum of two USDC balances (6 decimals), e.g. Base + Polygon. */
export function formatTotalUsdcBalance(
  a: bigint | undefined,
  b: bigint | undefined,
): string {
  const x = a != null ? parseFloat(formatUnits(a, 6)) : 0
  const y = b != null ? parseFloat(formatUnits(b, 6)) : 0
  return `$${(x + y).toFixed(2)}`
}

/** Returns https Basescan URL only for a valid 0x address. */
export function baseScanAddressUrl(addr: string): string | null {
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return null
  return `https://basescan.org/address/${addr}`
}

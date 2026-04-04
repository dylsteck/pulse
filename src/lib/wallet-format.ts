import { formatUnits } from 'viem'

export function shortWalletAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function formatUsdcBalance(raw: bigint | undefined): string {
  if (raw == null) return '—'
  return `$${parseFloat(formatUnits(raw, 6)).toFixed(2)}`
}

/** Returns https Basescan URL only for a valid 0x address. */
export function baseScanAddressUrl(addr: string): string | null {
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return null
  return `https://basescan.org/address/${addr}`
}

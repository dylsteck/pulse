/**
 * CAIP-19 Asset Identifier Utilities
 *
 * Implements a CAIP-19-like identifier scheme for all asset types in Pulse.
 * Format: chain_id/asset_namespace:asset_reference
 *
 * Blockchain assets (tokens, memes) use standard CAIP-19.
 * Solana SPL memes use the Chain Agnostic draft namespace `token` (mint address);
 * `spl-token` and `spl` are accepted on decode for legacy/interop URLs.
 * Polymarket and Hyperliquid use Pulse-defined CAIP-2-like chain IDs (see README).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssetType = 'tokens' | 'markets' | 'perps' | 'memes'

export interface AssetIdentifier {
  /** CAIP-2 chain ID, e.g. "eip155:8453" or "polymarket:mainnet" */
  chainId: string
  /** Asset namespace, e.g. "erc20", "event", "perp" */
  namespace: string
  /** Asset reference (address, ID, symbol, etc.) */
  reference: string
}

export interface ParsedAsset {
  type: AssetType
  identifier: AssetIdentifier
  /** The raw encoded CAIP-19 string (before percent-encoding) */
  raw: string
}

// ---------------------------------------------------------------------------
// Chain IDs
// ---------------------------------------------------------------------------

const CHAIN_IDS = {
  base: 'eip155:8453',
  solana: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  polymarket: 'polymarket:mainnet',
  hyperliquid: 'hyperliquid:mainnet',
} as const

// ---------------------------------------------------------------------------
// Namespace mappings per asset type
// ---------------------------------------------------------------------------

const TYPE_TO_NAMESPACE: Record<AssetType, string> = {
  tokens: 'erc20',
  memes: 'token',
  markets: 'event',
  perps: 'perp',
}

/** Namespaces for non-Solana chains only (Solana memes use resolveType). */
const NAMESPACE_TO_TYPE: Record<string, AssetType> = {
  erc20: 'tokens',
  event: 'markets',
  perp: 'perps',
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build a raw CAIP-19 string (not percent-encoded).
 */
function buildRawId(
  chainId: string,
  namespace: string,
  reference: string,
): string {
  return `${chainId}/${namespace}:${reference}`
}

/**
 * Parse a raw CAIP-19 string into its components.
 * Returns null if the string is malformed.
 */
function parseRawId(raw: string): AssetIdentifier | null {
  // Format: chain_id/namespace:reference
  // chain_id itself contains ':' so we split carefully
  const slashIdx = raw.indexOf('/')
  if (slashIdx === -1) return null

  const chainId = raw.slice(0, slashIdx)
  const rest = raw.slice(slashIdx + 1)

  const colonIdx = rest.indexOf(':')
  if (colonIdx === -1) return null

  const namespace = rest.slice(0, colonIdx)
  const reference = rest.slice(colonIdx + 1)

  if (!chainId || !namespace || !reference) return null

  return { chainId, namespace, reference }
}

/**
 * Determine the AssetType from chain id + namespace.
 * Solana mainnet accepts `token` (canonical), `spl-token` (legacy Pulse), and `spl` (common elsewhere).
 */
function resolveType(chainId: string, namespace: string): AssetType | null {
  if (chainId === CHAIN_IDS.solana) {
    if (
      namespace === 'token' ||
      namespace === 'spl-token' ||
      namespace === 'spl'
    ) {
      return 'memes'
    }
    return null
  }
  return NAMESPACE_TO_TYPE[namespace] ?? null
}

// ---------------------------------------------------------------------------
// Public API – Encoding
// ---------------------------------------------------------------------------

/**
 * Encode an asset type + reference into a CAIP-19 identifier string.
 * The returned string is ready for use in a URL path segment
 * (callers should percent-encode it if needed).
 */
export function encodeAssetId(type: AssetType, reference: string): string {
  const chainId = getChainIdForType(type)
  const namespace = TYPE_TO_NAMESPACE[type]
  return buildRawId(chainId, namespace, reference)
}

/**
 * Encode an AssetIdentifier into a CAIP-19 string.
 */
export function encodeAssetIdentifier(identifier: AssetIdentifier): string {
  return buildRawId(
    identifier.chainId,
    identifier.namespace,
    identifier.reference,
  )
}

/**
 * Return the CAIP-2 chain ID for a given asset type.
 */
export function getChainIdForType(type: AssetType): string {
  switch (type) {
    case 'tokens':
      return CHAIN_IDS.base
    case 'memes':
      return CHAIN_IDS.solana
    case 'markets':
      return CHAIN_IDS.polymarket
    case 'perps':
      return CHAIN_IDS.hyperliquid
    default:
      return CHAIN_IDS.base
  }
}

// ---------------------------------------------------------------------------
// Public API – Decoding
// ---------------------------------------------------------------------------

/**
 * Decode a raw CAIP-19 string (percent-decode first if coming from a URL)
 * into a ParsedAsset.
 */
export function decodeAssetId(encoded: string): ParsedAsset | null {
  const parsed = parseRawId(encoded)
  if (!parsed) return null

  const type = resolveType(parsed.chainId, parsed.namespace)
  if (!type) return null

  const identifier =
    type === 'memes' && parsed.chainId === CHAIN_IDS.solana
      ? { ...parsed, namespace: 'token' }
      : parsed

  return {
    type,
    identifier,
    raw: encoded,
  }
}

/**
 * Check if a string is a valid CAIP-19 identifier.
 */
export function isValidAssetId(encoded: string): boolean {
  return decodeAssetId(encoded) !== null
}

// ---------------------------------------------------------------------------
// Convenience builders
// ---------------------------------------------------------------------------

/** Build a CAIP-19 identifier for a Base ERC-20 token. */
export function buildTokenId(address: string): string {
  return encodeAssetId('tokens', address.toLowerCase())
}

/** Build a CAIP-19 identifier for a Solana meme token. */
export function buildMemeId(address: string): string {
  return encodeAssetId('memes', address)
}

/** Build a CAIP-19 identifier for a Polymarket event. */
export function buildMarketId(eventId: string): string {
  return encodeAssetId('markets', eventId)
}

/** Build a CAIP-19 identifier for a Hyperliquid perp. */
export function buildPerpId(coin: string): string {
  return encodeAssetId('perps', `${coin.toLowerCase()}-perp`)
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Encode a CAIP-19 identifier for safe use in a URL path segment.
 * Applies percent-encoding to :, /, and other special chars.
 */
export function encodeForUrl(identifier: string): string {
  return encodeURIComponent(identifier)
}

/**
 * Decode a URL-encoded CAIP-19 identifier back to its raw form.
 */
export function decodeFromUrl(encoded: string): string {
  return decodeURIComponent(encoded)
}

/**
 * Build a full asset URL path: /asset/:identifier
 */
export function buildAssetUrl(type: AssetType, reference: string): string {
  const raw = encodeAssetId(type, reference)
  return `/asset/${encodeForUrl(raw)}`
}

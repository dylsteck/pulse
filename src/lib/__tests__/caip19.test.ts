import { describe, expect, test } from 'bun:test'
import {
  buildMarketId,
  buildMemeId,
  buildPerpId,
  buildTokenId,
  decodeAssetId,
  encodeAssetId,
} from '@/lib/caip19'

const SOLANA = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
const MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

describe('encode / decode round-trip', () => {
  test('tokens', () => {
    const raw = buildTokenId('0x4ed4e862860bed51a9570b96d89af5e1b0efefed')
    const parsed = decodeAssetId(raw)
    expect(parsed?.type).toBe('tokens')
    expect(parsed?.identifier.namespace).toBe('erc20')
    expect(parsed?.identifier.reference).toBe(
      '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
    )
  })

  test('memes emit canonical token namespace', () => {
    const raw = buildMemeId(MINT)
    expect(raw).toBe(`${SOLANA}/token:${MINT}`)
    const parsed = decodeAssetId(raw)
    expect(parsed?.type).toBe('memes')
    expect(parsed?.identifier.namespace).toBe('token')
    expect(parsed?.identifier.reference).toBe(MINT)
  })

  test('markets', () => {
    const raw = buildMarketId('12345')
    const parsed = decodeAssetId(raw)
    expect(parsed?.type).toBe('markets')
    expect(parsed?.identifier.namespace).toBe('event')
    expect(parsed?.identifier.reference).toBe('12345')
  })

  test('perps', () => {
    const raw = buildPerpId('BTC')
    expect(raw).toContain('/perp:btc-perp')
    const parsed = decodeAssetId(raw)
    expect(parsed?.type).toBe('perps')
    expect(parsed?.identifier.reference).toBe('btc-perp')
  })
})

describe('Solana legacy and interop namespaces', () => {
  test('decodes spl-token (legacy Pulse) and normalizes namespace to token', () => {
    const legacy = `${SOLANA}/spl-token:${MINT}`
    const parsed = decodeAssetId(legacy)
    expect(parsed?.type).toBe('memes')
    expect(parsed?.identifier.namespace).toBe('token')
    expect(parsed?.identifier.reference).toBe(MINT)
    expect(parsed?.raw).toBe(legacy)
  })

  test('decodes spl (common external form)', () => {
    const external = `${SOLANA}/spl:${MINT}`
    const parsed = decodeAssetId(external)
    expect(parsed?.type).toBe('memes')
    expect(parsed?.identifier.namespace).toBe('token')
    expect(parsed?.identifier.reference).toBe(MINT)
  })

  test('rejects unknown namespace on Solana', () => {
    expect(decodeAssetId(`${SOLANA}/unknown:${MINT}`)).toBeNull()
  })
})

describe('encodeAssetId', () => {
  test('memes use token namespace', () => {
    expect(encodeAssetId('memes', MINT)).toBe(`${SOLANA}/token:${MINT}`)
  })
})

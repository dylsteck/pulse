import { describe, expect, test } from 'bun:test'
import { formatCompact, formatDate, formatPrice } from '@/lib/format'

describe('formatCompact', () => {
  test('formats values under 1K', () => {
    expect(formatCompact(0)).toBe('$0')
    expect(formatCompact(99)).toBe('$99')
    expect(formatCompact(500)).toBe('$500')
  })

  test('formats thousands', () => {
    expect(formatCompact(1e3)).toBe('$1K')
    expect(formatCompact(5.5e3)).toBe('$6K')
  })

  test('formats millions', () => {
    expect(formatCompact(1e6)).toBe('$1.0M')
    expect(formatCompact(2.5e6)).toBe('$2.5M')
  })

  test('formats billions', () => {
    expect(formatCompact(1e9)).toBe('$1.0B')
    expect(formatCompact(1.5e9)).toBe('$1.5B')
  })
})

describe('formatPrice', () => {
  test('formats small prices with 8 decimals', () => {
    expect(formatPrice(0.00001)).toBe('0.00001000')
    expect(formatPrice(0.0001)).toBe('0.00010000')
  })

  test('formats mid-range prices with 6 decimals', () => {
    expect(formatPrice(0.001)).toBe('0.001000')
    expect(formatPrice(0.5)).toBe('0.500000')
  })

  test('formats prices >= 1 with 4 decimals', () => {
    expect(formatPrice(1)).toBe('1.0000')
    expect(formatPrice(100)).toBe('100.0000')
  })

  test('formats prices >= 1000 with 2 decimals', () => {
    expect(formatPrice(1000)).toBe('1,000.00')
    expect(formatPrice(1234.56)).toBe('1,234.56')
  })
})

describe('formatDate', () => {
  test('formats valid ISO date', () => {
    const result = formatDate('2024-03-15T12:00:00Z')
    expect(result).toMatch(/Mar|March/)
    expect(result).toMatch(/15/)
  })

  test('returns em dash for invalid date', () => {
    expect(formatDate('invalid')).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})

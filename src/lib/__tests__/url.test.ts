import { describe, expect, test } from 'bun:test'
import { sanitizeExternalHttpUrl } from '@/lib/url'

describe('sanitizeExternalHttpUrl', () => {
  test('accepts https urls', () => {
    expect(sanitizeExternalHttpUrl('https://example.com/docs')).toBe(
      'https://example.com/docs',
    )
  })

  test('accepts http urls and trims whitespace', () => {
    expect(sanitizeExternalHttpUrl('  http://example.com/path  ')).toBe(
      'http://example.com/path',
    )
  })

  test('rejects non-http schemes', () => {
    expect(sanitizeExternalHttpUrl('javascript:alert(1)')).toBeNull()
    expect(sanitizeExternalHttpUrl('data:text/html,hello')).toBeNull()
    expect(sanitizeExternalHttpUrl('mailto:test@example.com')).toBeNull()
  })

  test('rejects malformed values', () => {
    expect(sanitizeExternalHttpUrl('')).toBeNull()
    expect(sanitizeExternalHttpUrl('not a url')).toBeNull()
    expect(sanitizeExternalHttpUrl(undefined)).toBeNull()
  })
})

import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { makeRequest } from '@/lib/request'

describe('makeRequest', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = async (url: string | URL): Promise<Response> => {
      const u = typeof url === 'string' ? url : url.toString()
      if (u.includes('ok')) {
        return new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      if (u.includes('404')) {
        return new Response(
          JSON.stringify({ error: 'Not found', message: 'Resource missing' }),
          { status: 404 },
        )
      }
      if (u.includes('500')) {
        return new Response(JSON.stringify({ message: 'Server error' }), {
          status: 500,
        })
      }
      if (u.includes('invalid-json')) {
        return new Response('not valid json {', { status: 200 })
      }
      return new Response('{}', { status: 200 })
    }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('parses JSON on 200', async () => {
    const result = await makeRequest<{ data: string }>('https://example.com/ok')
    expect(result).toEqual({ data: 'test' })
  })

  test('throws on 404 with error message from body', async () => {
    await expect(makeRequest('https://example.com/404')).rejects.toThrow(
      /Not found|Resource missing|404/,
    )
  })

  test('throws on 500', async () => {
    await expect(makeRequest('https://example.com/500')).rejects.toThrow(
      /Server error|500/,
    )
  })

  test('throws on invalid JSON response', async () => {
    await expect(
      makeRequest('https://example.com/invalid-json'),
    ).rejects.toThrow(/Invalid JSON/)
  })
})

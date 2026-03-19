import { beforeEach, describe, expect, test } from 'bun:test'
import { act, renderHook } from '@testing-library/react'
import { useIsMobile } from '../use-is-mobile'

describe('useIsMobile', () => {
  const listeners: (() => void)[] = []

  beforeEach(() => {
    listeners.length = 0
    ;(global as any).matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_: string, handler: () => void) => {
        listeners.push(handler)
      },
      removeEventListener: (_: string, handler: () => void) => {
        const i = listeners.indexOf(handler)
        if (i >= 0) listeners.splice(i, 1)
      },
      dispatchEvent: () => true,
    })
  })

  test('returns boolean', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
  })

  test('returns false when matchMedia matches is false', () => {
    ;(global as any).matchMedia = () => ({
      matches: false,
      media: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  test('returns true when matchMedia matches is true', () => {
    ;(global as any).matchMedia = () => ({
      matches: true,
      media: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  test('updates when matchMedia change event fires', () => {
    let matches = false
    const mq = {
      get matches() {
        return matches
      },
      media: '(max-width: 768px)',
      addEventListener: (_: string, handler: () => void) => {
        listeners.push(handler)
      },
      removeEventListener: (_: string, handler: () => void) => {
        const i = listeners.indexOf(handler)
        if (i >= 0) listeners.splice(i, 1)
      },
      dispatchEvent: () => true,
    }
    ;(global as any).matchMedia = () => mq

    const { result, rerender } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    matches = true
    act(() => {
      listeners.forEach((fn) => fn())
    })
    expect(result.current).toBe(true)
  })
})

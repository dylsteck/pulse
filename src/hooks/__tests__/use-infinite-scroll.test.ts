import { beforeEach, describe, expect, test } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useInfiniteScroll } from '../use-infinite-scroll'

describe('useInfiniteScroll', () => {
  const mockObserve = () => {}
  const mockDisconnect = () => {}
  let callback: (entries: Array<{ isIntersecting: boolean }>) => void

  beforeEach(() => {
    callback = () => {}
    ;(global as any).IntersectionObserver = class MockIntersectionObserver {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        callback = cb
      }
      observe = mockObserve
      disconnect = mockDisconnect
    }
  })

  test('calls loadMore when element intersects', () => {
    let loadMoreCalled = false
    const loadMoreMock = () => {
      loadMoreCalled = true
    }

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      const div = document.createElement('div')
      ;(ref as any).current = div
      useInfiniteScroll(ref, {
        hasMore: true,
        isFetching: false,
        loadMore: loadMoreMock,
      })
      return ref
    })

    // Simulate intersection
    callback([{ isIntersecting: true }])

    expect(loadMoreCalled).toBe(true)
  })

  test('does not call loadMore when not intersecting', () => {
    let loadMoreCalled = false
    const loadMoreMock = () => {
      loadMoreCalled = true
    }

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      const div = document.createElement('div')
      ;(ref as any).current = div
      useInfiniteScroll(ref, {
        hasMore: true,
        isFetching: false,
        loadMore: loadMoreMock,
      })
      return ref
    })

    callback([{ isIntersecting: false }])

    expect(loadMoreCalled).toBe(false)
  })

  test('does not call loadMore when hasMore is false', () => {
    let loadMoreCalled = false
    const loadMoreMock = () => {
      loadMoreCalled = true
    }

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      const div = document.createElement('div')
      ;(ref as any).current = div
      useInfiniteScroll(ref, {
        hasMore: false,
        isFetching: false,
        loadMore: loadMoreMock,
      })
      return ref
    })

    callback([{ isIntersecting: true }])

    expect(loadMoreCalled).toBe(false)
  })

  test('does not call loadMore when isFetching is true', () => {
    let loadMoreCalled = false
    const loadMoreMock = () => {
      loadMoreCalled = true
    }

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      const div = document.createElement('div')
      ;(ref as any).current = div
      useInfiniteScroll(ref, {
        hasMore: true,
        isFetching: true,
        loadMore: loadMoreMock,
      })
      return ref
    })

    callback([{ isIntersecting: true }])

    expect(loadMoreCalled).toBe(false)
  })
})

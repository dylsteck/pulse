import { useEffect } from 'react'

export interface UseInfiniteScrollOptions {
  hasMore: boolean
  isFetching: boolean
  loadMore: () => void
  enabled?: boolean
  rootMargin?: string
  root?: Element | null
  threshold?: number
}

export function useInfiniteScroll(
  ref: React.RefObject<HTMLDivElement | null>,
  options: UseInfiniteScrollOptions,
): void {
  const {
    hasMore,
    isFetching,
    loadMore,
    enabled = true,
    rootMargin = '300px 0px',
    root = null,
    threshold = 0,
  } = options

  useEffect(() => {
    if (!enabled) return
    if (!hasMore || isFetching) return
    const target = ref.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry.isIntersecting &&
          hasMore &&
          !isFetching
        ) {
          loadMore()
        }
      },
      { root, rootMargin, threshold },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [enabled, hasMore, isFetching, loadMore, ref, root, rootMargin, threshold])
}

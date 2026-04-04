import { useQuery } from '@tanstack/react-query'
import { CLOB_HOST } from '@/lib/wagmi'

async function checkGeoBlock(): Promise<boolean> {
  try {
    const response = await fetch(`${CLOB_HOST}/time`, {
      headers: { Accept: 'application/json' },
    })
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return true
    if (response.status === 403) return true
    return false
  } catch {
    // Network error — can't determine, assume not blocked
    return false
  }
}

export function usePolymarketGeoStatus() {
  return useQuery({
    queryKey: ['polymarket', 'geo-status'],
    queryFn: checkGeoBlock,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}

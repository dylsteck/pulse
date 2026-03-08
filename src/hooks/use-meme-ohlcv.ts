import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@/lib/request'

export interface MemeOhlcvBar {
  time: number
  value: number
}

interface MemeOhlcvResponse {
  bars: MemeOhlcvBar[]
  error?: string
}

async function fetchMemeOhlcv(
  poolAddress: string,
  windowLabel: string,
): Promise<MemeOhlcvBar[]> {
  const params = new URLSearchParams({
    poolAddress,
    window: windowLabel,
  })
  const res = await makeRequest<MemeOhlcvResponse>(
    `/api/geckoterminal/ohlcv?${params.toString()}`,
  )
  return res.bars ?? []
}

export function useMemeOhlcv(
  poolAddress: string | null,
  windowLabel: string,
): {
  data: MemeOhlcvBar[]
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['geckoterminal', 'ohlcv', poolAddress, windowLabel],
    queryFn: () => fetchMemeOhlcv(poolAddress!, windowLabel),
    staleTime: 60_000,
    refetchInterval: 60_000,
    enabled: !!poolAddress,
  })

  return {
    data: data ?? [],
    isLoading,
    isError,
  }
}

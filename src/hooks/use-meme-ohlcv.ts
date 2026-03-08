import { useQuery } from '@tanstack/react-query'

export interface MemeOhlcvBar {
  time: number
  value: number
}

interface MemeOhlcvResponse {
  bars?: MemeOhlcvBar[]
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
  const res = await fetch(`/api/geckoterminal/ohlcv?${params.toString()}`)
  const json = (await res.json()) as MemeOhlcvResponse
  return json.bars ?? []
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

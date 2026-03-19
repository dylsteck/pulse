import { useQuery } from '@tanstack/react-query'
import type { BarDataPoint } from '@/lib/codex'
import { fetchCodexBars } from '@/lib/codex'

export function useTokenBars(
  address: string,
  windowLabel: string,
): {
  data: Array<BarDataPoint>
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['codex', 'bars', address, windowLabel],
    queryFn: () => fetchCodexBars(address, windowLabel),
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: !!address,
  })

  return {
    data: data?.bars ?? [],
    isLoading,
    isError,
  }
}

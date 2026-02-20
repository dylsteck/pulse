import { useQuery } from '@tanstack/react-query'
import { fetchTrendingSongs, fetchAudioDetail } from '@/lib/tortoise'

export function useTortoiseSongs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['tortoise', 'trending', page, limit],
    queryFn: () => fetchTrendingSongs('30d', page, limit),
    staleTime: 3_600_000,
    gcTime: 3_600_000,
  })
}

export function useAudioDetail(slug: string | null) {
  return useQuery({
    queryKey: ['tortoise', 'audio', slug],
    queryFn: () => fetchAudioDetail(slug!),
    enabled: !!slug,
  })
}

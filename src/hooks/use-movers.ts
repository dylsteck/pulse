import { getTopMovers } from '@/lib/mock/movers'
import type { Token } from '@/lib/mock/tokens'

export function useMovers(count = 8): Token[] {
  return getTopMovers(count)
}

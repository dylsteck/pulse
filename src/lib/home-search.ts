import type { SearchMiddleware } from '@tanstack/router-core'
import type { ViewMode } from '@/components/dashboard/tabs'
import type { SortKey } from '@/lib/grid-filter-types'
import {
  DEFAULT_FILTERS,
  coerceGridFilters,
  getDefaultSortForMode,
} from '@/components/dashboard/grid-filter-popover'

const VALID_TYPES: Array<ViewMode> = [
  'trending',
  'tokens',
  'markets',
  'perps',
  'memes',
]

export type HomeSearch = {
  type: ViewMode
  sort: SortKey
  networks: Array<number>
}

function parseNetworks(raw: unknown): Array<number> {
  if (raw == null || raw === '') return []
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : Number(v)))
      .filter((n) => Number.isFinite(n))
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try {
        return parseNetworks(JSON.parse(trimmed) as unknown)
      } catch {
        return []
      }
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isFinite(n))
  }
  return []
}

export function validateHomeSearch(search: Record<string, unknown>): HomeSearch {
  const t = search?.type
  const type: ViewMode = VALID_TYPES.includes(t as ViewMode)
    ? (t as ViewMode)
    : 'trending'
  const networks = parseNetworks(search.networks)
  const sortRaw = typeof search.sort === 'string' ? search.sort : undefined
  const filters = coerceGridFilters(type, {
    ...DEFAULT_FILTERS,
    sort: (sortRaw as SortKey) ?? DEFAULT_FILTERS.sort,
    networks,
  })
  return { type, sort: filters.sort, networks: filters.networks }
}

export function stripHomeSearchDefaults(): SearchMiddleware<HomeSearch> {
  return ({ search, next }) => {
    const result = next(search)
    const copy = { ...result }
    const mode = copy.type ?? 'trending'
    if (copy.sort === getDefaultSortForMode(mode)) {
      delete (copy as Partial<HomeSearch>).sort
    }
    if (!copy.networks?.length) {
      delete (copy as Partial<HomeSearch>).networks
    }
    return copy as HomeSearch
  }
}

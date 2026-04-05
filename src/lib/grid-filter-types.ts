export type SortKey =
  | 'change'
  | 'volume'
  | 'marketCap'
  | 'liquidity'
  | 'valuation'

export type NetworkFilter = 'all' | number

export interface GridFilters {
  sort: SortKey
  network: NetworkFilter
}

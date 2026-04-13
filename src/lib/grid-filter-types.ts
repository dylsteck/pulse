export type SortKey =
  | 'change'
  | 'volume'
  | 'marketCap'
  | 'liquidity'
  | 'valuation'

export interface GridFilters {
  sort: SortKey
  /** Empty = all networks. Otherwise include tokens on any of these chain IDs. */
  networks: Array<number>
}

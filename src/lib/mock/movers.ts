import { TOKENS, type Token } from './tokens'

export function getTopMovers(count = 8): Token[] {
  return [...TOKENS]
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, count)
}

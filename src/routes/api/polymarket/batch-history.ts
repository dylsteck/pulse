import { createFileRoute } from '@tanstack/react-router'
import {
  CLOB_FIDELITY_MINUTES,
  getClobIntervalForWindowLabel,
  isValidPolymarketWindowLabel,
} from '@/lib/polymarket-clob'
import { readUpstreamJson, upstreamErrorResponse } from '@/lib/server/upstream'

const MAX_IDS = 20
/** CLOB token ids are long numeric strings */
const CLOB_TOKEN_ID_RE = /^\d{1,128}$/

export const Route = createFileRoute('/api/polymarket/batch-history')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: unknown
        try {
          parsed = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !('tokenIds' in parsed)
        ) {
          return Response.json(
            { error: 'Expected JSON object with tokenIds array' },
            { status: 400 },
          )
        }

        const rawIds = (parsed as { tokenIds: unknown }).tokenIds
        if (!Array.isArray(rawIds)) {
          return Response.json({ error: 'tokenIds must be an array' }, {
            status: 400,
          })
        }

        if (rawIds.length === 0 || rawIds.length > MAX_IDS) {
          return Response.json(
            { error: `tokenIds must have between 1 and ${MAX_IDS} entries` },
            { status: 400 },
          )
        }

        const tokenIds: Array<string> = []
        for (const id of rawIds) {
          if (typeof id !== 'string' || !CLOB_TOKEN_ID_RE.test(id)) {
            return Response.json({ error: 'Invalid token id' }, { status: 400 })
          }
          tokenIds.push(id)
        }

        const unique = [...new Set(tokenIds)]
        const url = new URL(request.url)
        const windowParam = url.searchParams.get('window')
        if (!isValidPolymarketWindowLabel(windowParam)) {
          return Response.json(
            { error: 'Invalid or missing window query (1h, 6h, 1d, 1w, 1m, all)' },
            { status: 400 },
          )
        }

        const interval = getClobIntervalForWindowLabel(windowParam)
        const sortedKey = [...unique].sort().join(',')
        const cacheKey = `polymarket:batch-history:${sortedKey}:${interval}:${CLOB_FIDELITY_MINUTES}`

        const upstreamBody = JSON.stringify({
          markets: unique,
          interval,
          fidelity: CLOB_FIDELITY_MINUTES,
        })

        try {
          const json = await readUpstreamJson(
            'https://clob.polymarket.com/batch-prices-history',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: upstreamBody,
              cacheTtlMs: 60_000,
              cacheKey,
            },
          )
          return Response.json(json, {
            headers: {
              'Cache-Control': 'public, max-age=60',
            },
          })
        } catch (error) {
          return upstreamErrorResponse(error)
        }
      },
    },
  },
})

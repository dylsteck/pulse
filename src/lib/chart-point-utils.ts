/** Shared helpers for Liveline single- and multi-series chart data (time/value points). */

export function ensureMinChartData(
  data: Array<{ time: number; value: number }>,
  currentValue: number,
): Array<{ time: number; value: number }> {
  if (data.length >= 2) return data
  if (data.length === 0) {
    const t = Date.now() / 1000
    const isSeconds = t < 1e10
    const oneHour = isSeconds ? 3600 : 3600_000
    return [
      { time: t - oneHour, value: currentValue },
      { time: t, value: currentValue },
    ]
  }
  const last = data[0]
  const val = last.value
  const t = last.time
  const isSeconds = t < 1e10
  const oneHour = isSeconds ? 3600 : 3600_000
  return [
    { time: t - oneHour, value: val },
    { time: t, value: currentValue },
  ]
}

/** At least two points for Liveline when APIs return sparse or empty series. */
export function buildSparseChartSeries(
  raw: Array<{ time: number; value: number }>,
  currentValue: number,
): Array<{ time: number; value: number }> {
  if (raw.length >= 2) return ensureMinChartData(raw, currentValue)
  if (raw.length === 1) return ensureMinChartData(raw, currentValue)
  if (Number.isFinite(currentValue)) return ensureMinChartData([], currentValue)
  return []
}

/** Normalize timestamp to seconds (APIs may return ms). */
export function toSeconds(t: number): number {
  return t > 1e12 ? t / 1000 : t
}

/** Extend data so the line stretches across the full visible window. */
export function extendToFullWindow(
  data: Array<{ time: number; value: number }>,
  windowSecs: number,
  currentValue: number,
): Array<{ time: number; value: number }> {
  if (data.length < 2) return data
  const now = Date.now() / 1000
  const windowStart = now - windowSecs

  const normalized = data
    .map((p) => ({ time: toSeconds(p.time), value: p.value }))
    .sort((a, b) => a.time - b.time)

  const first = normalized[0]
  const last = normalized[normalized.length - 1]
  let result = normalized

  if (first.time > windowStart) {
    result = [{ time: windowStart, value: first.value }, ...result]
  }
  if (last.time < now) {
    result = [...result, { time: now, value: currentValue }]
  }
  return result
}

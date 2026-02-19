import { defineEventHandler, getRouterParam, getQuery, createError } from 'nitro/h3'

const TORTOISE_BASE = 'https://tortoise.studio'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  const pathSegments = path ? path.split('/').filter(Boolean) : []
  const apiPath = pathSegments.length > 0 ? pathSegments.join('/') : ''
  const query = getQuery(event)
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const url = `${TORTOISE_BASE}/api/${apiPath}${queryString ? `?${queryString}` : ''}`

  const res = await fetch(url)
  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: res.statusText,
    })
  }
  return res.json()
})

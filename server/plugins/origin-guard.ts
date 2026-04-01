import { definePlugin } from 'nitro'
import { createError, getHeader } from 'nitro/h3'

function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    if (!event.path.startsWith('/api/')) return

    const prodUrl = process.env.PULSE_PROD_URL?.trim()
    if (!prodUrl || process.env.NODE_ENV === 'development') return

    const origin = getHeader(event, 'origin') ?? getHeader(event, 'referer')
    const allowedOrigin = toOrigin(prodUrl)
    const requestOrigin = origin ? toOrigin(origin) : null
    const allowed = Boolean(allowedOrigin && requestOrigin === allowedOrigin)

    if (!allowed) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      })
    }
  })
})

import { definePlugin } from 'nitro'
import { createError, getHeader } from 'nitro/h3'

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    if (!event.path.startsWith('/api/')) return

    const prodUrl = process.env.PULSE_PROD_URL?.trim()
    if (!prodUrl || process.env.NODE_ENV === 'development') return

    const origin = getHeader(event, 'origin') ?? getHeader(event, 'referer')
    const base = prodUrl.replace(/\/$/, '')
    const allowed =
      origin &&
      (origin === base ||
        origin === `${base}/` ||
        origin.startsWith(`${base}/`))

    if (!allowed) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      })
    }
  })
})

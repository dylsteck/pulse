import { createStart, createMiddleware } from '@tanstack/react-start'
import { getApiOriginGuardResponse } from '@/lib/server/origin-guard'

const originGuardMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const blocked = getApiOriginGuardResponse(request)
    if (blocked) return blocked
    return await next()
  },
)

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [originGuardMiddleware],
  }
})

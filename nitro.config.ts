import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  routeRules: {
    '/api/tortoise/**': { proxy: 'https://tortoise.studio/api' },
  },
  devProxy: {
    '/api/tortoise': { target: 'https://tortoise.studio/api', changeOrigin: true },
  },
})

import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  plugins: ['server/plugins/origin-guard.ts'],
})

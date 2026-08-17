import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const isNodeTarget = process.env.DEPLOY_TARGET === 'node'

const config = defineConfig({
  server: {
    hmr: {
      overlay: false,
    },
  },
  ssr: {
    noExternal: ['@coinbase/cdp-react'],
  },
  plugins: [
    isNodeTarget ? nitro() : cloudflare({ viteEnvironment: { name: 'ssr' } }),
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

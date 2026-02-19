import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  ssr: {
    noExternal: ['@coinbase/cdp-react', '@coinbase/cdp-hooks', '@coinbase/cdp-core', '@coinbase/cdp-wagmi'],
  },
  server: {
    proxy: {
      '/api/tortoise': {
        target: 'https://tortoise.studio',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tortoise/, '/api'),
      },
    },
  },
  plugins: [
    devtools(),
    nitro(),
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

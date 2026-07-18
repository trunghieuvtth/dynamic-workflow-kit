import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Vitest config riêng — tách khỏi vite.config.ts để tránh xung đột type
// giữa vite/rolldown và vitest's bundled vite.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/test/**',
          'src/**/*.d.ts',
          'src/vite-env.d.ts',
        ],
      },
    },
  })
)

import { defineConfig } from 'vite'
import { builtinModules } from 'module'

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    outDir: 'dist',
    target: 'node24',
    sourcemap: true,
    rollupOptions: {
      // Keep Node.js built-ins external — they are available in the Node.js runtime.
      // Bundle everything else (including @actions/core) so dist/ is self-contained.
      external: builtinModules.flatMap((m) => [m, `node:${m}`])
    }
  }
})

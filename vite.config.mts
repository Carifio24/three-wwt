// Utilities
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import legacy from '@vitejs/plugin-legacy';

const isLegacyBuild = process.env.LEGACY === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "three-wwt",
      fileName: "three-wwt",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "vue",
        }
      }
    }
  },
  plugins: [
    // Only included when LEGACY=true (i.e. `yarn build-legacy`).
    // Generates a legacy bundle (SystemJS + polyfills) for browsers that don't
    // support native ES modules — targets ~2017-era browsers (Chrome 49+,
    // Firefox 52+, Safari 10+, Edge 14+).
    // renderModernChunks: false — only emit the legacy bundle (not both modern
    // + legacy), which halves the Babel/terser work and keeps the output simple.
    ...(isLegacyBuild ? [legacy({
      targets: ['chrome >= 62', 'firefox >= 53', 'safari >= 11', 'edge >= 16'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderModernChunks: false,
    })] : []),
    dts({ rollupTypes: true }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.mjs',
      '.ts',
    ],
  },
});

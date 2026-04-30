// Utilities
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

import legacy from '@vitejs/plugin-legacy';

const isLegacyBuild = process.env.LEGACY === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
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
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
});

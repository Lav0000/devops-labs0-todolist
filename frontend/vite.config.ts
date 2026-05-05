import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Root-relative paths so assets work on S3 / CloudFront
  base: '/',

  build: {
    // Output directory — index.html will be at the root of this folder
    outDir: 'dist',
    // Keep hashed assets under /assets/
    assetsDir: 'assets',
    // Generate a manifest for cache-busting reference
    manifest: true,
    // Minify for production
    minify: 'esbuild',
    // Raise chunk warning limit (optional)
    chunkSizeWarningLimit: 600,
  },

  server: {
    // Dev-only proxy to local backend API
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})

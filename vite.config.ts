import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    manifest: !isSsrBuild,
    rollupOptions: {
      output: { manualChunks: isSsrBuild ? undefined : { motion: ['motion/react'] } },
    },
  },
}));

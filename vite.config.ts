import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { introScript } from './src/components/intro-session';

/**
 * The intro itself is a React component, so it renders in dev like anything
 * else. Its once-per-session guard, however, is injected into <head> by
 * `scripts/prerender.mjs`, which never runs under `vite dev` — without this
 * the intro would replay on every page while developing. Same source, same
 * rule (the entrance of the site only), so dev behaves like production.
 */
function introDevPlugin(): Plugin {
  return {
    name: 'avyor-intro-dev',
    apply: 'serve',
    transformIndexHtml(html, ctx) {
      // `ctx.path` is the resolved file (always /index.html under the SPA
      // fallback); the requested route is on `originalUrl`.
      const route = (ctx.originalUrl ?? ctx.path ?? '/').split('?')[0];
      const isHome = route === '/' || route === '/index.html';
      return html.replace('<!--head-->', isHome ? `<script>${introScript}</script>` : '');
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), introDevPlugin()],
  build: {
    manifest: !isSsrBuild,
    rollupOptions: {
      output: { manualChunks: isSsrBuild ? undefined : { motion: ['motion/react'] } },
    },
  },
}));

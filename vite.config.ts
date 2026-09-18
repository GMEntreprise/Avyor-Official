import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { randomBytes } from 'node:crypto';
import { copyFileSync, createReadStream, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { introScript } from './src/components/intro-session';
import { isHomeRoute } from './src/i18n/locales';
import { createNewsApi } from './src/news/admin-api.server';
import { defaultPaths, type NewsPaths } from './src/news/store.server';

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
      const route = ctx.originalUrl ?? ctx.path ?? '/';
      return html.replace(
        '<!--head-->',
        isHomeRoute(route) ? `<script>${introScript}</script>` : '',
      );
    },
  };
}

/**
 * The News admin, on the development server only.
 *
 * `apply: 'serve'` keeps it out of every build: the deployed site has no admin
 * page and no endpoint. The admin page receives a token generated when the
 * server starts; the API refuses any request without it (see
 * src/news/admin-api.server.ts). NEWS_ROOT points the admin at a throwaway
 * content tree, which is how the end-to-end test publishes without touching
 * the real articles.
 */
function newsAdminPlugin(): Plugin {
  const token = randomBytes(24).toString('hex');
  const root = process.env.NEWS_ROOT;
  const paths: NewsPaths = root
    ? {
        published: join(root, 'news'),
        drafts: join(root, 'drafts'),
        media: join(root, 'media'),
        vercel: join(root, 'vercel.json'),
      }
    : defaultPaths;
  if (root) {
    for (const dir of [paths.published, paths.drafts, paths.media])
      mkdirSync(dir, { recursive: true });
    if (!existsSync(paths.vercel)) copyFileSync('vercel.json', paths.vercel);
  }
  return {
    name: 'avyor-news-admin',
    apply: 'serve',
    configureServer(server) {
      let api: ReturnType<typeof createNewsApi> | null = null;
      server.middlewares.use((req, res, next) => {
        // A sandboxed media store is not under public/: serve it here.
        if (root && req.url?.startsWith('/news/media/')) {
          const file = join(paths.media, basename(req.url.split('?')[0]));
          if (existsSync(file)) {
            res.setHeader('content-type', 'image/webp');
            return void createReadStream(file).pipe(res);
          }
        }
        if (!req.url?.startsWith('/__news/api/')) return next();
        const address = server.httpServer?.address();
        const port = typeof address === 'object' && address ? address.port : 5173;
        api ??= createNewsApi({ paths, token, port });
        void api(req, res, next);
      });
    },
    transformIndexHtml(html, ctx) {
      if (!ctx.path.startsWith('/admin/')) return html;
      return html.replace(
        '<!--admin-token-->',
        `<meta name="avyor-admin-token" content="${token}">`,
      );
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), introDevPlugin(), newsAdminPlugin()],
  build: {
    manifest: !isSsrBuild,
    // Never inline assets as base64: under 4 kB Vite would fold them into the
    // JavaScript, which is exactly where the illustrations must not travel.
    assetsInlineLimit: 0,
    rollupOptions: {
      output: { manualChunks: isSsrBuild ? undefined : { motion: ['motion/react'] } },
    },
  },
}));

import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { randomBytes } from 'node:crypto';
import { copyFileSync, createReadStream, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { introScript } from './src/components/intro-session';
import { isHomeRoute } from './src/i18n/locales';
import { localizeShell } from './src/i18n/dev-shell';
import { splitPath } from './src/i18n/locales';
import { newsPayloadFor, publicCorpus } from './src/news/build';
import { listPublished } from './src/news/store.server';
import { createNewsApi } from './src/news/admin-api.server';
import { defaultPaths, type NewsPaths } from './src/news/store.server';

/**
 * The News data of the requested route, as the build embeds it in each page.
 * Read from the published articles at every request, so an article published
 * in the admin shows up on the next reload.
 */
function newsScript(route: string) {
  const { locale, slug } = splitPath(route.split('?')[0].replace(/index\.html$/, ''));
  try {
    const payload = newsPayloadFor(publicCorpus(listPublished(defaultPaths)), locale, slug);
    return `<script id="avyor-news" type="application/json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
  } catch (error) {
    // A corpus the build would refuse must not take the whole dev server down:
    // the page loses its News, and the reason is on the console.
    console.warn('News indisponible en développement :', (error as Error).message);
    return '';
  }
}

/**
 * What `scripts/prerender.mjs` does for each language and each page, applied to
 * the single document the dev server serves — because the prerender never runs
 * under `vite dev`, and anything only it provides is missing while developing.
 *
 * Two things: the language of the address (the page reads its language from
 * `<html lang>`), and the intro's once-per-session guard on an entry page, from
 * the same source and the same rule as the build.
 */
function shellDevPlugin(): Plugin {
  return {
    name: 'avyor-shell-dev',
    apply: 'serve',
    transformIndexHtml(html, ctx) {
      // `ctx.path` is the resolved file (always /index.html under the SPA
      // fallback); the requested route is on `originalUrl`.
      const route = ctx.originalUrl ?? ctx.path ?? '/';
      const head = `${isHomeRoute(route) ? `<script>${introScript}</script>` : ''}${newsScript(route)}`;
      return localizeShell(html.replace('<!--head-->', head), route);
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
function newsAdminPlugin(password: string): Plugin {
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
        api ??= createNewsApi({ paths, token, port, password });
        void api(req, res, next);
      });
    },
    transformIndexHtml(html, ctx) {
      if (!ctx.path.startsWith('/admin/')) return html;
      // The page never carries the token any more: it is exchanged for the
      // password. All it needs to know is whether a password exists at all.
      return html.replace(
        '<!--admin-gate-->',
        `<meta name="avyor-admin-gate" content="${password ? 'ready' : 'absent'}">`,
      );
    },
  };
}

export default defineConfig(({ isSsrBuild, mode }) => ({
  // Read from `.env.local`, which is never committed: the repository is public.
  // Nothing of it reaches the browser — it is only compared, on this machine.
  plugins: [
    react(),
    tailwindcss(),
    shellDevPlugin(),
    newsAdminPlugin(loadEnv(mode, process.cwd(), 'AVYOR_').AVYOR_ADMIN_PASSWORD ?? ''),
  ],
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

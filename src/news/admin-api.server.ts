/**
 * The admin API — the only way to change an article.
 *
 * It exists on the local development server alone: the production site is a
 * set of static files with no endpoint, so there is nothing there to attack.
 * Locally it still refuses anything that did not come from the admin page:
 *
 *   · a password, asked once per browser session. The server holds it from
 *     `AVYOR_ADMIN_PASSWORD` (in `.env.local`, never committed); without it
 *     configured, the admin stays closed. Attempts are compared in constant
 *     time, slowed down, and locked out after a handful of failures;
 *   · a per-session token, generated when the server starts and handed out
 *     only in exchange for the password. Another site cannot read it
 *     (same-origin policy) and cannot send the custom header carrying it
 *     without a CORS preflight, which this API never grants;
 *   · the Host header must be this machine, which defeats DNS rebinding;
 *   · the Origin header, when sent, must be this server.
 *
 * Every rule about content — safety, completeness, uniqueness, revisions —
 * lives in the store and the model, so it applies here and in the build alike.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { assignHeadingIds } from './model.ts';
import {
  archive,
  ConflictError,
  createDraft,
  duplicate,
  listDrafts,
  listPublished,
  NotFoundError,
  publish,
  readArticle,
  saveDraft,
  saveMedia,
  unpublish,
  ValidationFailed,
  type NewsPaths,
} from './store.server.ts';
import type { Article } from './types';

const JSON_LIMIT = 2 * 1024 * 1024;
const MEDIA_LIMIT = 8 * 1024 * 1024 + 1;

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function send(res: ServerResponse, status: number, value: unknown) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    // Private data: never stored by a browser or a proxy.
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

async function readBody(req: IncomingMessage, limit: number) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'Requête trop volumineuse.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const readJson = async (req: IncomingMessage) => {
  try {
    return JSON.parse((await readBody(req, JSON_LIMIT)).toString('utf8') || '{}');
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Corps de requête illisible.');
  }
};

function sameToken(given: unknown, expected: string) {
  if (typeof given !== 'string' || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/**
 * Compared on their digests, so two passwords of different lengths still take
 * the same time to reject — and the password never has to be measured.
 */
const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();
const samePassword = (given: unknown, expected: string) =>
  typeof given === 'string' && timingSafeEqual(digest(given), digest(expected));

/** How a wrong password is answered: slowly, then not at all for a minute. */
const ATTEMPTS = 5;
const LOCKOUT = 60_000;

/** The admin list: one row per article, whatever state it is in. */
function overview(paths: NewsPaths) {
  const drafts = new Map(listDrafts(paths).map((a) => [a.id, a]));
  const published = new Map(listPublished(paths).map((a) => [a.id, a]));
  const ids = new Set([...drafts.keys(), ...published.keys()]);
  return [...ids]
    .map((id) => {
      const draft = drafts.get(id);
      const online = published.get(id);
      const current = (draft ?? online) as Article;
      return {
        id,
        locale: current.locale,
        title: current.title,
        slug: current.slug,
        audience: current.audience,
        theme: current.theme,
        // What a visitor sees, and whether something waits to go online.
        state: online ? 'published' : (draft?.status ?? 'draft'),
        pendingChanges: Boolean(online && draft),
        updatedAt: current.updatedAt,
        publishedAt: current.publishedAt,
        revision: current.revision,
      };
    })
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export function createNewsApi({
  paths,
  token,
  port,
  password = '',
  now = Date.now,
}: {
  paths: NewsPaths;
  token: string;
  port: number;
  /** Empty means no password configured: the admin refuses to open at all. */
  password?: string;
  now?: () => number;
}) {
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  let failures = 0;
  let lockedUntil = 0;
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://local');
    if (!url.pathname.startsWith('/__news/api/')) return next();
    const route = url.pathname.slice('/__news/api'.length);
    try {
      if (!hosts.has(req.headers.host ?? '')) throw new HttpError(403, 'Hôte refusé.');
      const origin = req.headers.origin;
      if (origin && !hosts.has(origin.replace(/^https?:\/\//, '')))
        throw new HttpError(403, 'Origine refusée.');
      const method = req.method ?? 'GET';

      // The one route reached without a token: it is how a token is obtained.
      if (route === '/session' && method === 'POST') {
        if (!password)
          throw new HttpError(
            503,
            'Aucun mot de passe d’administration n’est configuré. Ajoutez AVYOR_ADMIN_PASSWORD dans .env.local, puis relancez le serveur.',
          );
        const remaining = lockedUntil - now();
        if (remaining > 0)
          throw new HttpError(
            429,
            `Trop de tentatives. Réessayez dans ${Math.ceil(remaining / 1000)} secondes.`,
          );
        const { password: given } = await readJson(req);
        if (!samePassword(given, password)) {
          // A wrong answer costs time, and five of them cost a minute.
          if (++failures >= ATTEMPTS) {
            failures = 0;
            lockedUntil = now() + LOCKOUT;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
          throw new HttpError(403, 'Mot de passe refusé.');
        }
        failures = 0;
        return send(res, 200, { token });
      }

      if (!sameToken(req.headers['x-avyor-admin'], token))
        throw new HttpError(403, 'Session d’administration expirée. Entrez le mot de passe.');
      let match: RegExpMatchArray | null;

      if (route === '/articles' && method === 'GET')
        return send(res, 200, { articles: overview(paths) });

      if (route === '/articles' && method === 'POST') {
        const { id, locale } = await readJson(req);
        return send(res, 200, await createDraft(paths, { id: String(id), locale: String(locale) }));
      }

      if ((match = route.match(/^\/articles\/([a-z0-9]{8,})$/))) {
        const id = match[1];
        if (method === 'GET') {
          const found = readArticle(paths, id);
          if (!found.draft && !found.published) throw new NotFoundError('Article introuvable.');
          return send(res, 200, found);
        }
        if (method === 'PUT') {
          const { article, expectedRevision } = await readJson(req);
          if (!article || typeof article !== 'object' || article.id !== id)
            throw new HttpError(400, 'Article incohérent.');
          const online = readArticle(paths, id).published;
          // Anchors follow the wording until the article has been online once.
          const body =
            article.body?.type === 'doc'
              ? assignHeadingIds(article.body, { keep: Boolean(online ?? article.publishedAt) })
              : article.body;
          return send(
            res,
            200,
            await saveDraft(paths, { ...article, body }, Number(expectedRevision)),
          );
        }
      }

      if (
        (match = route.match(
          /^\/articles\/([a-z0-9]{8,})\/(publish|unpublish|archive|duplicate)$/,
        )) &&
        method === 'POST'
      ) {
        const [, id, action] = match;
        if (action === 'publish') return send(res, 200, await publish(paths, id));
        if (action === 'unpublish') return send(res, 200, await unpublish(paths, id));
        if (action === 'archive') return send(res, 200, await archive(paths, id));
        const { newId } = await readJson(req);
        if (!/^[a-z0-9]{8,}$/.test(String(newId)))
          throw new HttpError(400, 'Identifiant invalide.');
        return send(res, 200, await duplicate(paths, id, String(newId)));
      }

      if (route === '/media' && method === 'POST') {
        const bytes = await readBody(req, MEDIA_LIMIT);
        const name = decodeURIComponent(String(req.headers['x-filename'] ?? 'image'));
        return send(res, 200, await saveMedia(paths, bytes, name));
      }

      throw new HttpError(404, 'Route inconnue.');
    } catch (error) {
      if (error instanceof ValidationFailed)
        return send(res, 422, { message: error.message, errors: error.errors });
      if (error instanceof ConflictError) return send(res, 409, { message: error.message });
      if (error instanceof NotFoundError) return send(res, 404, { message: error.message });
      if (error instanceof HttpError) return send(res, error.status, { message: error.message });
      // An unexpected failure is reported as one, never as a success.
      return send(res, 500, {
        message: `Échec de l’écriture : ${(error as Error).message ?? 'erreur inconnue'}.`,
      });
    }
  };
}

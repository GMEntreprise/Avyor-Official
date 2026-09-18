/**
 * Where articles live, and the only code allowed to change them.
 *
 * Server side only — the build and the local admin import it; no browser
 * bundle ever does (a test checks it). Two directories, two audiences:
 *
 *   content/news/          the published version of each article, committed
 *                          and deployed. The site is built from this alone.
 *   content/news-drafts/   drafts and pending edits. Ignored by git: the
 *                          repository is public, so a committed draft would
 *                          be readable by anyone before its publication.
 *
 * Every mutation runs one at a time, is written atomically, and is checked
 * against the revision the editor started from, so a double click or a second
 * tab can never overwrite newer work.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { join, parse } from 'node:path';
import { isMediaSrc, slugify, validateArticle } from './model.ts';
import { localePrefix, isLocale } from '../i18n/locales.ts';
import type { Article, PMNode, ValidationError } from './types';

export interface NewsPaths {
  published: string;
  drafts: string;
  media: string;
  vercel: string;
}

export const defaultPaths: NewsPaths = {
  published: 'content/news',
  drafts: 'content/news-drafts',
  media: 'public/news/media',
  vercel: 'vercel.json',
};

export class ConflictError extends Error {
  status = 409;
  constructor(
    message = 'Cet article a été modifié entre-temps. Rechargez-le avant d’enregistrer.',
  ) {
    super(message);
  }
}

export class NotFoundError extends Error {
  status = 404;
}

export class ValidationFailed extends Error {
  status = 422;
  errors: ValidationError[];
  constructor(errors: ValidationError[]) {
    super(errors.map((e) => e.message).join(' '));
    this.errors = errors;
  }
}

/* ----------------------------------------------------------- exclusivité */

let queue: Promise<unknown> = Promise.resolve();

/** Runs mutations one after another, so two of them never interleave. */
function exclusive<T>(task: () => T | Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/* -------------------------------------------------------------- fichiers */

const fileOf = (dir: string, id: string) => {
  if (!/^[a-z0-9]{8,}$/.test(id)) throw new NotFoundError('Identifiant invalide.');
  return join(dir, `${id}.json`);
};

function readJson(file: string): Article | undefined {
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Article) : undefined;
}

/** Written next to its destination, then renamed: never half a file. */
function writeAtomic(file: string, content: string | Buffer) {
  const temp = `${file}.${randomBytes(4).toString('hex')}.tmp`;
  writeFileSync(temp, content);
  renameSync(temp, file);
}

const writeArticle = (dir: string, article: Article) => {
  mkdirSync(dir, { recursive: true });
  writeAtomic(fileOf(dir, article.id), `${JSON.stringify(article, null, 2)}\n`);
};

function listDir(dir: string): Article[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')) as Article);
}

export const listPublished = (paths: NewsPaths) =>
  listDir(paths.published).map((article) => ({ ...article, status: 'published' as const }));

export const listDrafts = (paths: NewsPaths) => listDir(paths.drafts);

export function readArticle(paths: NewsPaths, id: string) {
  const published = readJson(fileOf(paths.published, id));
  const draft = readJson(fileOf(paths.drafts, id));
  return {
    published: published ? { ...published, status: 'published' as const } : undefined,
    draft,
  };
}

/* --------------------------------------------------------------- brouillons */

function blank(id: string, locale: string, now: string): Article {
  return {
    id,
    locale,
    title: '',
    slug: '',
    slugHistory: [],
    excerpt: '',
    type: 'guide',
    audience: 'both',
    theme: 'prepare',
    author: { kind: 'organization', name: 'Équipe éditoriale AVYOR' },
    featured: false,
    cover: { src: '', width: 0, height: 0, alt: '' },
    body: { type: 'doc', content: [{ type: 'paragraph' }] },
    sources: [],
    cta: { label: '', slug: 'download' },
    related: [],
    translations: {},
    seo: { title: '', description: '', noindex: false },
    revision: 1,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    status: 'draft',
  };
}

/**
 * The errors that make content unsafe to keep at all — a dangerous link, an
 * unknown block. An incomplete draft is normal; an unsafe one is refused.
 */
const unsafe = (errors: ValidationError[]) =>
  errors
    .filter((e) => e.field === 'id' || e.field.startsWith('body') || e.field.startsWith('sources'))
    .filter((e) => !/vide|obligatoire|manquant/i.test(e.message));

/**
 * A new draft. The id comes from the editor, which makes creation idempotent:
 * submitting the same form twice returns the article created the first time.
 */
export function createDraft(paths: NewsPaths, { id, locale }: { id: string; locale: string }) {
  return exclusive(() => {
    if (!isLocale(locale))
      throw new ValidationFailed([{ field: 'locale', message: 'Langue inconnue.' }]);
    const existing = readArticle(paths, id);
    if (existing.draft) return existing.draft;
    if (existing.published) return existing.published;
    const draft = blank(id, locale, new Date().toISOString());
    writeArticle(paths.drafts, draft);
    return draft;
  });
}

/**
 * Saves the editor's version as a draft. For an article already online this
 * is a pending change: the published file is not touched until publication.
 */
export function saveDraft(paths: NewsPaths, article: Article, expectedRevision: number) {
  return exclusive(() => {
    const { published, draft } = readArticle(paths, article.id);
    const current = draft ?? published;
    if (!current) throw new NotFoundError('Article introuvable.');
    if (current.revision !== expectedRevision) throw new ConflictError();
    if (!isLocale(article.locale))
      throw new ValidationFailed([{ field: 'locale', message: 'Langue inconnue.' }]);
    const next: Article = {
      ...article,
      id: current.id,
      status: 'draft',
      revision: expectedRevision + 1,
      createdAt: current.createdAt,
      slugHistory: published?.slugHistory ?? current.slugHistory ?? [],
      publishedAt: published?.publishedAt ?? current.publishedAt ?? null,
      updatedAt: current.updatedAt,
      ...(published ? { basedOnRevision: published.revision } : {}),
    };
    if (!published) delete next.basedOnRevision;
    const refused = unsafe(validateArticle(next));
    if (refused.length) throw new ValidationFailed(refused);
    writeArticle(paths.drafts, next);
    return next;
  });
}

export function duplicate(paths: NewsPaths, id: string, newId: string) {
  return exclusive(() => {
    const { published, draft } = readArticle(paths, id);
    const source = draft ?? published;
    if (!source) throw new NotFoundError('Article introuvable.');
    if (readArticle(paths, newId).draft) return readArticle(paths, newId).draft as Article;
    const now = new Date().toISOString();
    const copy: Article = {
      ...source,
      id: newId,
      title: source.title ? `${source.title} (copie)` : '',
      slug: source.slug ? `${source.slug}-copie` : '',
      slugHistory: [],
      translations: {},
      featured: false,
      status: 'draft',
      revision: 1,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };
    delete copy.basedOnRevision;
    writeArticle(paths.drafts, copy);
    return copy;
  });
}

/* --------------------------------------------------------------- publication */

function images(node: PMNode, found: string[] = []) {
  if (node.type === 'image' && typeof node.attrs?.src === 'string') found.push(node.attrs.src);
  node.content?.forEach((child) => images(child, found));
  return found;
}

const mediaExists = (paths: NewsPaths, src: string) =>
  isMediaSrc(src) && existsSync(join(paths.media, src.split('/').pop() as string));

/**
 * Puts the draft online. Everything is checked before anything is written:
 * completeness, safety, media on disk and the uniqueness of the address in
 * its language — including addresses other articles used before, which still
 * redirect to them.
 */
export function publish(paths: NewsPaths, id: string, now = new Date()) {
  return exclusive(() => {
    const { published, draft } = readArticle(paths, id);
    if (!draft) throw new NotFoundError('Aucun brouillon à publier.');
    const stamp = now.toISOString();
    const history =
      published && published.slug !== draft.slug
        ? [...published.slugHistory, published.slug]
        : [...(published?.slugHistory ?? draft.slugHistory ?? [])];
    const candidate: Article = {
      ...draft,
      status: 'published',
      publishedAt: published?.publishedAt ?? draft.publishedAt ?? stamp,
      updatedAt: stamp,
      slugHistory: [...new Set(history)].filter((slug) => slug && slug !== draft.slug),
    };
    delete candidate.basedOnRevision;

    const errors = validateArticle(candidate, { publishing: true, now });
    if (candidate.cover?.src && !mediaExists(paths, candidate.cover.src))
      errors.push({ field: 'cover.src', message: 'L’image principale est absente du stockage.' });
    for (const src of images(candidate.body))
      if (!mediaExists(paths, src))
        errors.push({ field: 'body', message: `Image absente du stockage : ${src}.` });
    for (const other of listPublished(paths)) {
      if (other.id === id || other.locale !== candidate.locale) continue;
      if (other.slug === candidate.slug || other.slugHistory.includes(candidate.slug))
        errors.push({
          field: 'slug',
          message: `Cette adresse est déjà utilisée par « ${other.title} ».`,
        });
    }
    if (errors.length) throw new ValidationFailed(errors);

    writeArticle(paths.published, candidate);
    rmSync(fileOf(paths.drafts, id), { force: true });
    writeRedirects(paths);
    return candidate;
  });
}

/** Takes the article offline; its content goes back to the drafts. */
export function unpublish(paths: NewsPaths, id: string) {
  return withdraw(paths, id, 'draft');
}

/** Takes the article offline and files it away, content intact. */
export function archive(paths: NewsPaths, id: string) {
  return withdraw(paths, id, 'archived');
}

function withdraw(paths: NewsPaths, id: string, status: 'draft' | 'archived') {
  return exclusive(() => {
    const { published, draft } = readArticle(paths, id);
    const base = draft ?? published;
    if (!base) throw new NotFoundError('Article introuvable.');
    const next: Article = {
      ...base,
      status,
      revision: Math.max(base.revision, published?.revision ?? 0) + 1,
    };
    delete next.basedOnRevision;
    writeArticle(paths.drafts, next);
    rmSync(fileOf(paths.published, id), { force: true });
    writeRedirects(paths);
    return next;
  });
}

/* ------------------------------------------------------------ redirections */

const newsPath = (locale: string, slug: string) =>
  `${isLocale(locale) ? localePrefix(locale) : ''}/news/${slug}/`;
const isNewsRedirect = (source: string) => /^(\/[a-z]{2})?\/news\//.test(source);

/** The permanent redirects every former address of a published article needs. */
export function newsRedirects(articles: Article[]) {
  return [...articles]
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap((article) =>
      article.slugHistory.map((old) => ({
        source: newsPath(article.locale, old),
        // Always the current address: never a chain through an older one.
        destination: newsPath(article.locale, article.slug),
        permanent: true,
      })),
    );
}

function writeRedirects(paths: NewsPaths) {
  // A sandbox may not have one yet; the real vercel.json always exists.
  const config = existsSync(paths.vercel)
    ? JSON.parse(readFileSync(paths.vercel, 'utf8'))
    : { redirects: [] };
  const kept = (config.redirects ?? []).filter(
    (rule: { source: string }) => !isNewsRedirect(rule.source),
  );
  config.redirects = [...kept, ...newsRedirects(listPublished(paths))];
  const next = `${JSON.stringify(config, null, 2)}\n`;
  if (!existsSync(paths.vercel) || readFileSync(paths.vercel, 'utf8') !== next)
    writeAtomic(paths.vercel, next);
}

/** Rewrites the News redirects of vercel.json from the published articles. */
export function syncRedirects(paths: NewsPaths) {
  writeRedirects(paths);
}

/* ----------------------------------------------------------------- médias */

const MAX_BYTES = 8 * 1024 * 1024;

/** What the bytes are, whatever the file claims to be. */
function sniff(buffer: Buffer) {
  if (
    buffer.length > 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return 'png';
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return 'jpeg';
  if (
    buffer.length > 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  )
    return 'webp';
  return null;
}

/**
 * Stores an uploaded image. Only real PNG, JPEG or WebP data is accepted —
 * never SVG, which can carry script. It is re-encoded, which also strips its
 * metadata (location included), and named after its content: the same image
 * uploaded twice gets the same address, and a new version gets a new one that
 * no cache has ever seen.
 */
export async function saveMedia(paths: NewsPaths, buffer: Buffer, filename: string) {
  if (buffer.length > MAX_BYTES)
    throw new ValidationFailed([{ field: 'file', message: 'Image trop lourde (8 Mo au plus).' }]);
  if (!sniff(buffer))
    throw new ValidationFailed([
      { field: 'file', message: 'Seules les images PNG, JPEG et WebP sont acceptées.' },
    ]);
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 8);
  const base = slugify(parse(filename).name).slice(0, 48) || 'image';
  const name = `${base}-${hash}.webp`;
  mkdirSync(paths.media, { recursive: true });
  const existing = readdirSync(paths.media).find((file) => file.endsWith(`-${hash}.webp`));
  if (existing) {
    const meta = await sharp(join(paths.media, existing)).metadata();
    return {
      src: `/news/media/${existing}`,
      width: meta.width ?? info.width,
      height: meta.height ?? info.height,
    };
  }
  writeAtomic(join(paths.media, name), data);
  return { src: `/news/media/${name}`, width: info.width, height: info.height };
}

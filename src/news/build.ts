import {
  AUDIENCES,
  PAGE_SIZE,
  THEMES,
  paginate,
  plainText,
  readingMinutes,
  validateArticle,
} from './model.ts';
import type { Article, ArticleSummary, MediaImage, SearchEntry } from './types';

/**
 * What the public site is built from.
 *
 * Only published articles ever reach these functions, and they hand back only
 * what a reader may see: no revision, no draft marker, no editorial notes.
 * The build calls them; so do the tests, with the same data.
 */

export class CorpusError extends Error {}

/** The fields a published page shows. Internal bookkeeping stays behind. */
export interface PublicArticle {
  id: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string;
  type: Article['type'];
  audience: Article['audience'];
  theme: Article['theme'];
  author: Article['author'];
  cover: MediaImage;
  body: Article['body'];
  sources: Article['sources'];
  cta: Article['cta'];
  seo: Article['seo'];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
}

export interface NewsIndexData {
  page: number;
  pages: number;
  total: number;
  featured: ArticleSummary | null;
  items: ArticleSummary[];
  /** Only the audiences and themes that have articles are offered as filters. */
  audiences: Article['audience'][];
  themes: Article['theme'][];
}

export interface NewsArticleData {
  article: PublicArticle;
  related: ArticleSummary[];
  alternates: { locale: string; slug: string }[];
}

/** The News data a page carries, embedded in its HTML for hydration. */
export interface NewsData {
  enabled: boolean;
  latest?: ArticleSummary[];
  index?: NewsIndexData;
  article?: NewsArticleData;
}

export function toPublic(article: Article): PublicArticle {
  return {
    id: article.id,
    locale: article.locale,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    type: article.type,
    audience: article.audience,
    theme: article.theme,
    author: article.author,
    cover: article.cover,
    body: article.body,
    sources: article.sources,
    cta: article.cta,
    seo: article.seo,
    publishedAt: article.publishedAt as string,
    updatedAt: article.updatedAt,
    readingMinutes: readingMinutes(article.body),
  };
}

export function summarize(article: Article): ArticleSummary {
  return {
    id: article.id,
    locale: article.locale,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    type: article.type,
    audience: article.audience,
    theme: article.theme,
    cover: article.cover,
    publishedAt: article.publishedAt as string,
    updatedAt: article.updatedAt,
    readingMinutes: readingMinutes(article.body),
    featured: article.featured,
  };
}

/**
 * The published articles, checked as a whole and sorted newest first.
 *
 * The editor already refuses these mistakes; the build refuses them again, so
 * a file edited by hand or merged by accident cannot put a broken article —
 * or two articles on the same address — online.
 */
export function publicCorpus(articles: Article[], now = new Date()): Article[] {
  const problems: string[] = [];
  for (const article of articles)
    for (const error of validateArticle(article, { publishing: true, now }))
      problems.push(`${article.id} · ${error.field} : ${error.message}`);
  const addresses = new Map<string, string>();
  for (const article of articles)
    for (const slug of [article.slug, ...article.slugHistory]) {
      const key = `${article.locale}/${slug}`;
      const owner = addresses.get(key);
      if (owner && owner !== article.id)
        problems.push(`${article.id} · slug : l’adresse ${key} appartient déjà à ${owner}.`);
      addresses.set(key, article.id);
    }
  if (problems.length) throw new CorpusError(`News : publication refusée.\n${problems.join('\n')}`);
  return [...articles].sort((a, b) =>
    (b.publishedAt as string).localeCompare(a.publishedAt as string),
  );
}

export const forLocale = (corpus: Article[], locale: string) =>
  corpus.filter((article) => article.locale === locale);

/**
 * One page of the index. The featured article, when the editor chose one,
 * opens the first page and is left out of the grid everywhere, so no reader
 * meets it twice and pagination stays stable.
 */
export function indexPage(list: Article[], page: number, size = PAGE_SIZE): NewsIndexData {
  const featured = list.find((article) => article.featured) ?? null;
  const rest = list.filter((article) => article !== featured).map(summarize);
  const slice = paginate(rest, page, size);
  return {
    page: slice.page,
    pages: slice.pages,
    total: list.length,
    featured: featured && slice.page === 1 ? summarize(featured) : null,
    items: slice.items,
    audiences: AUDIENCES.filter((audience) =>
      list.some((article) => article.audience === audience || article.audience === 'both'),
    ).filter((audience) => audience !== 'both'),
    themes: THEMES.filter((theme) => list.some((article) => article.theme === theme)),
  };
}

export const pageCount = (list: Article[], size = PAGE_SIZE) => indexPage(list, 1, size).pages;

/**
 * Up to three articles worth reading next: the editor's picks first, then
 * articles on the same theme. Nothing else — an empty block is better than an
 * unrelated one.
 */
export function relatedFor(article: Article, list: Article[], max = 3): ArticleSummary[] {
  const pool = list.filter((other) => other.id !== article.id && other.locale === article.locale);
  const picked = article.related
    .map((id) => pool.find((other) => other.id === id))
    .filter((other): other is Article => Boolean(other));
  const sameTheme = pool.filter(
    (other) => other.theme === article.theme && !picked.includes(other),
  );
  return [...picked, ...sameTheme].slice(0, max).map(summarize);
}

/** The translations that exist, are published and point back to this article. */
export function alternatesFor(article: Article, corpus: Article[]) {
  return Object.entries(article.translations)
    .map(([locale, id]) => corpus.find((other) => other.id === id && other.locale === locale))
    .filter(
      (other): other is Article =>
        Boolean(other) && other?.translations[article.locale] === article.id,
    )
    .map((other) => ({ locale: other.locale, slug: other.slug }));
}

/** What client-side search reads: summaries plus the plain text of each body. */
export function searchIndex(list: Article[]): (ArticleSummary & SearchEntry)[] {
  return list.map((article) => ({
    ...summarize(article),
    text: plainText(article.body).replace(/\s+/g, ' ').trim(),
  }));
}

/* ---------------------------------------------------------------------- RSS */

const xml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] as string,
  );

export function rssFeed(
  list: Article[],
  feed: {
    origin: string;
    locale: string;
    title: string;
    description: string;
    link: string;
    self: string;
  },
) {
  const prefix = feed.link.replace(/\/$/, '');
  const items = list
    .map(
      (article) =>
        `<item><title>${xml(article.title)}</title><link>${xml(`${prefix}/${article.slug}/`)}</link><guid isPermaLink="false">${xml(article.id)}</guid><pubDate>${new Date(article.publishedAt as string).toUTCString()}</pubDate><description>${xml(article.excerpt)}</description></item>`,
    )
    .join('');
  const updated = list[0]?.updatedAt ?? new Date(0).toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(feed.title)}</title><link>${xml(feed.link)}</link><description>${xml(feed.description)}</description><language>${xml(feed.locale)}</language><lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate><atom:link href="${xml(feed.self)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

/** The payload a page embeds for hydration: which languages have News, plus this route's data. */
export interface NewsPayload extends Omit<NewsData, 'enabled'> {
  enabledLocales: string[];
}

/**
 * The News data a single route carries.
 *
 * The build writes this into every page it prerenders. Development serves one
 * template for every address and never runs the prerender, so the dev server
 * builds it on the fly from the same corpus — without it, News simply does not
 * exist while developing: no link in the navigation, no latest articles on the
 * home page, no article page. That is exactly how the section stayed invisible
 * in dev while being complete in the build.
 */
export function newsPayloadFor(corpus: Article[], locale: string, slug: string): NewsPayload {
  const enabledLocales = [...new Set(corpus.map((article) => article.locale))].filter(
    (other) => forLocale(corpus, other).length > 0,
  );
  const payload: NewsPayload = { enabledLocales };
  const list = forLocale(corpus, locale);
  if (!list.length) return payload;

  if (slug === '') {
    payload.latest = list.slice(0, 3).map(summarize);
    return payload;
  }
  const page = /^news\/page\/(\d+)$/.exec(slug);
  if (slug === 'news' || page) {
    payload.index = indexPage(list, page ? Number(page[1]) : 1);
    return payload;
  }
  const article = slug.startsWith('news/')
    ? list.find((other) => other.slug === slug.slice('news/'.length))
    : undefined;
  if (article)
    payload.article = {
      article: toPublic(article),
      related: relatedFor(article, list),
      alternates: alternatesFor(article, corpus),
    };
  return payload;
}

/**
 * The News data model.
 *
 * An article body is a ProseMirror document — the format the editor works in
 * natively — so what the author formats is exactly what is stored, previewed
 * and published. Nothing is converted on the way, and the table of contents is
 * read from the same headings the page renders.
 */

export type NewsType = 'guide' | 'product' | 'case';
export type NewsAudience = 'brands' | 'creators' | 'both';
export type NewsTheme = 'prepare' | 'create' | 'choose' | 'measure';

export interface Mark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface PMNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMNode[];
  marks?: Mark[];
  text?: string;
}

export interface PMDoc extends PMNode {
  type: 'doc';
  content: PMNode[];
}

export interface Author {
  /** An editorial team is an organisation, never a made-up person. */
  kind: 'organization' | 'person';
  name: string;
  role?: string;
  url?: string;
}

export interface MediaImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface Source {
  title: string;
  url: string;
  publisher?: string;
  /** When the source was read, since rules and figures change. */
  accessed?: string;
}

export interface Article {
  id: string;
  locale: string;
  title: string;
  slug: string;
  /** Slugs this article was published under before; each one redirects here. */
  slugHistory: string[];
  excerpt: string;
  type: NewsType;
  audience: NewsAudience;
  theme: NewsTheme;
  author: Author;
  featured: boolean;
  cover: MediaImage;
  body: PMDoc;
  sources: Source[];
  /** One action per article, towards a page that exists on the site. */
  cta: { label: string; slug: string };
  related: string[];
  /** Real translations only: locale → id of the published article. */
  translations: Record<string, string>;
  seo: { title: string; description: string; image?: MediaImage; noindex: boolean };
  /** Incremented on every save; guards against overwriting a newer version. */
  revision: number;
  createdAt: string;
  /** Last editorial change a reader can see — not every internal save. */
  updatedAt: string;
  publishedAt: string | null;
  status?: 'draft' | 'published' | 'archived';
  /** For a draft of an article already online: the revision it started from. */
  basedOnRevision?: number;
}

export interface TocEntry {
  id: string;
  text: string;
  children: TocEntry[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/** What a card, the search index and the feed need — never the full body. */
export interface ArticleSummary {
  id: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string;
  type: NewsType;
  audience: NewsAudience;
  theme: NewsTheme;
  cover: MediaImage;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  featured: boolean;
}

export interface SearchEntry {
  id: string;
  title: string;
  excerpt: string;
  text: string;
  audience: NewsAudience;
  theme: NewsTheme;
}

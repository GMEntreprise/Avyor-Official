import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { GOOGLE_SITE_VERIFICATION } from '../src/config/search-console.ts';
import {
  appleAppSiteAssociation,
  assetLinks,
  isAuthSlug,
  isPrivateResource,
} from '../src/config/deep-links.ts';
import {
  render,
  contentFor,
  config,
  introScript,
  LOCALES,
  DEFAULT_LOCALE,
  isHomeRoute,
  localeMeta,
  routeFor,
  listPublished,
  defaultPaths,
  newsRedirects,
  publicCorpus,
  forLocale,
  indexPage,
  pageCount,
  relatedFor,
  alternatesFor,
  searchIndex,
  rssFeed,
  toPublic,
  summarize,
} from '../.ssr/entry-server.js';

/*
 * DIST_DIR and NEWS_DIR exist for the tests: the same build runs against a
 * copy of dist/ and a set of fixture articles, so published pages can be
 * checked end to end without ever publishing anything real.
 */
const dist = process.env.DIST_DIR || 'dist';
const newsDir = process.env.NEWS_DIR || defaultPaths.published;

/**
 * The template, kept aside the first time it is seen: the home page is
 * written over dist/index.html, so a second run needs the untouched copy.
 */
const fresh = await readFile(`${dist}/index.html`, 'utf8');
if (fresh.includes('<!--app-->')) await writeFile('.ssr/template.html', fresh);
const template = fresh.includes('<!--app-->')
  ? fresh
  : await readFile('.ssr/template.html', 'utf8');

const origin = config.origin;
/*
 * Indexability is baked into the bundle at build time. A test copy of the site
 * (never `dist/` itself) may force it, so that its sitemap can be checked.
 */
const indexable =
  dist !== 'dist' && process.env.FIXTURE_INDEXABLE === 'true' ? true : config.indexable;
const font = (await readdir(`${dist}/assets`)).find(
  (name) => name.startsWith('manrope-latin-') && name.endsWith('.woff2'),
);
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
/** JSON inside a <script>: `<` escaped, so no text can close the element. */
const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

/** The absolute address of a page in one language. */
const canonical = (locale, slug) => origin + routeFor(locale, slug);

/**
 * Every language this page exists in, plus the default a search engine should
 * fall back to. Google requires the set to be reciprocal and to include the
 * page itself, so it is built from the same list the site is prerendered from.
 */
const alternates = (slug, locales = LOCALES) => [
  ...locales.map((locale) => ({ hreflang: localeMeta[locale].tag, href: canonical(locale, slug) })),
  ...(locales.includes(DEFAULT_LOCALE)
    ? [{ hreflang: 'x-default', href: canonical(DEFAULT_LOCALE, slug) }]
    : []),
];

const organization = {
  '@type': 'Organization',
  '@id': origin + '/#organization',
  name: 'AVYOR',
  url: origin + '/',
  logo: origin + '/icon-512.png',
  email: config.email,
};
const website = {
  '@type': 'WebSite',
  '@id': origin + '/#website',
  name: 'AVYOR',
  url: origin + '/',
  inLanguage: LOCALES.map((l) => localeMeta[l].tag),
  description: contentFor(DEFAULT_LOCALE).facts,
  publisher: { '@id': origin + '/#organization' },
};
const breadcrumb = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item,
  })),
});
const defaultImage = { url: `${origin}/og.png`, width: 1200, height: 630 };

/** The <head> every page shares, whatever it is about. */
function baseHead({
  locale,
  title,
  description,
  url,
  noindex = false,
  links = [],
  ogType = 'website',
  ogLocales = LOCALES.filter((l) => l !== locale),
  image = defaultImage,
  graph,
  extra = '',
  // Un aperçu de lien se déplie dans une conversation de groupe, devant des
  // gens qui n'ont rien à voir avec elle : une page privée n'en a pas.
  social = true,
}) {
  const meta = localeMeta[locale];
  const hreflang = links
    .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`)
    .join('');
  const ogAlternates = ogLocales
    .map((l) => `<meta property="og:locale:alternate" content="${localeMeta[l].ogLocale}">`)
    .join('');
  const imageAlt = image.alt
    ? `<meta property="og:image:alt" content="${escape(image.alt)}"><meta name="twitter:image:alt" content="${escape(image.alt)}">`
    : '';
  return `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${indexable && !noindex ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${url}">${hreflang}<meta name="theme-color" content="#0B1020"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">${social ? `<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="AVYOR"><meta property="og:locale" content="${meta.ogLocale}">${ogAlternates}<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image.url}"><meta property="og:image:width" content="${image.width}"><meta property="og:image:height" content="${image.height}">${imageAlt}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image.url}">` : ''}${extra}<script type="application/ld+json">${scriptJson({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

function head(locale, page) {
  const content = contentFor(locale);
  const meta = localeMeta[locale];
  const url = canonical(locale, page.slug);
  const graph = [
    organization,
    website,
    {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name: page.title,
      description: page.description,
      inLanguage: meta.tag,
      isPartOf: { '@id': origin + '/#website' },
    },
  ];
  if (page.slug && page.slug !== '404')
    graph.push(
      breadcrumb([
        [content.ui.page.home, canonical(locale, '')],
        [page.label, url],
      ]),
    );
  if (page.slug === '' || page.slug === 'faq')
    graph.push({
      '@type': 'FAQPage',
      inLanguage: meta.tag,
      mainEntity: content.faqs.map((q) => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: q.a },
      })),
    });
  if ((config.apple || config.google) && page.slug === 'download')
    graph.push({
      '@type': 'SoftwareApplication',
      name: 'AVYOR',
      applicationCategory: 'BusinessApplication',
      operatingSystem: [config.apple ? 'iOS' : null, config.google ? 'Android' : null]
        .filter(Boolean)
        .join(', '),
      downloadUrl: config.apple || config.google,
      description: content.facts,
    });
  return baseHead({
    locale,
    title: page.title,
    description: page.description,
    url,
    noindex: page.noindex,
    links: page.noindex ? [] : alternates(page.slug),
    graph,
    // Une collaboration, une conversation, un retour d'authentification : rien
    // de tout cela ne se déplie dans un aperçu de lien.
    social: !isPrivateResource(page.slug) && !isAuthSlug(page.slug),
    // La propriété du domaine se prouve sur l'accueil, et se reprouve : la
    // balise reste après la validation, sinon l'accès à Search Console tombe.
    extra: page.slug
      ? ''
      : `<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}">`,
  });
}

/** The document shell, with the language it is written in on <html>. */
const document = (locale, headHtml, body, extraHtmlAttrs = '') =>
  template
    .replace(
      /<html[^>]*>/,
      `<html lang="${localeMeta[locale].tag}" dir="${localeMeta[locale].dir}"${extraHtmlAttrs}>`,
    )
    // A function, not a string: a « $& » typed in an article title must stay
    // text, not become a replacement pattern.
    .replace('<!--head-->', () => headHtml)
    .replace('<!--app-->', () => body);

const preload = font
  ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin>`
  : '';

async function writePage(route, html) {
  const dir = `${dist}${route}`.replace(/\/$/, '') || dist;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, html);
}

/* =================================================================== News */

/**
 * The published articles, checked as a whole: an invalid article, a duplicated
 * address or a missing image stops the build rather than going online broken.
 * Drafts live elsewhere and are never read here.
 */
const corpus = publicCorpus(listPublished({ ...defaultPaths, published: newsDir }));
const mediaMissing = [];
for (const article of corpus) {
  const images = [article.cover.src, article.seo.image?.src].filter(Boolean);
  const walk = (node) => {
    if (node.type === 'image') images.push(node.attrs.src);
    node.content?.forEach(walk);
  };
  walk(article.body);
  for (const src of images)
    if (!existsSync(`${dist}${src}`)) mediaMissing.push(`${article.id} : ${src}`);
}
if (mediaMissing.length)
  throw new Error(`News : images absentes du build.\n${mediaMissing.join('\n')}`);

/*
 * The redirects of former article addresses live in vercel.json, written by
 * the admin at publication. A hand edit that lets them drift from the
 * articles would leave an old link answering 404: the build refuses it.
 */
if (!process.env.NEWS_DIR) {
  const expected = newsRedirects(corpus);
  const declared = (JSON.parse(await readFile('vercel.json', 'utf8')).redirects ?? []).filter(
    (rule) => /^(\/[a-z]{2})?\/news\//.test(rule.source),
  );
  if (JSON.stringify(declared) !== JSON.stringify(expected))
    throw new Error(
      'News : les redirections de vercel.json ne correspondent plus aux articles publiés. Republiez depuis l’admin ou lancez `bun run news:redirects`.',
    );
}

/** A language gets a News section only once it has something to read. */
const newsLocales = LOCALES.filter((locale) => forLocale(corpus, locale).length > 0);
const payloadScript = (payload) =>
  `<script id="avyor-news" type="application/json">${scriptJson(payload)}</script>`;
const newsFor = (locale, extra = {}) => ({
  enabled: newsLocales.includes(locale),
  ...extra,
});
const newsPayload = (_locale, extra = {}) => ({ enabledLocales: newsLocales, ...extra });
const absolute = (src) => (/^https?:/.test(src) ? src : origin + src);
const lastModified = (list) =>
  list.reduce((latest, a) => (a.updatedAt > latest ? a.updatedAt : latest), '');

/* ================================================================ Pages */

let written = 0;
for (const locale of LOCALES) {
  const latest = forLocale(corpus, locale).slice(0, 3).map(summarize);
  for (const page of contentFor(locale).pages) {
    const route = routeFor(locale, page.slug);
    // Only the home page lists the latest articles.
    const extra = page.slug === '' && latest.length ? { latest } : {};
    await writePage(
      route,
      document(
        locale,
        `${preload}${head(locale, page)}${isHomeRoute(route) ? `<script>${introScript}</script>` : ''}${payloadScript(newsPayload(locale, extra))}`,
        render(locale, route, newsFor(locale, extra)),
      ),
    );
    written++;
  }
}

/* ============================================================ News pages */

const sitemapNews = [];
let newsPages = 0;
for (const locale of newsLocales) {
  const content = contentFor(locale);
  const ui = content.ui.news;
  const list = forLocale(corpus, locale);
  const feedUrl = canonical(locale, 'news') + 'feed.xml';
  const feedLink = `<link rel="alternate" type="application/rss+xml" title="${escape(ui.feed)}" href="${feedUrl}">`;
  const pages = pageCount(list);

  for (let n = 1; n <= pages; n++) {
    const slug = n === 1 ? 'news' : `news/page/${n}`;
    const route = routeFor(locale, slug);
    const url = canonical(locale, slug);
    const index = indexPage(list, n);
    // Each page of the list is its own document with its own canonical: page 2
    // is not a copy of page 1 and is never folded into it.
    const title = n === 1 ? ui.metaTitle : `${ui.metaTitle} — ${ui.page(n, pages)}`;
    const description =
      n === 1 ? ui.metaDescription : `${ui.page(n, pages)}. ${ui.metaDescription}`;
    const graph = [
      organization,
      website,
      {
        '@type': 'CollectionPage',
        '@id': url + '#webpage',
        url,
        name: title,
        description,
        inLanguage: localeMeta[locale].tag,
        isPartOf: { '@id': origin + '/#website' },
      },
      breadcrumb([
        [content.ui.page.home, canonical(locale, '')],
        [ui.label, canonical(locale, 'news')],
        ...(n > 1 ? [[ui.page(n, pages), url]] : []),
      ]),
    ];
    const extra = { index };
    await writePage(
      route,
      document(
        locale,
        `${preload}${baseHead({
          locale,
          title,
          description,
          url,
          // Only page 1 of the list has equivalents in other languages.
          links: n === 1 ? alternates('news', newsLocales) : [],
          ogLocales: n === 1 ? newsLocales.filter((l) => l !== locale) : [],
          graph,
          extra: `${feedLink}${n > 1 ? `<link rel="prev" href="${canonical(locale, n === 2 ? 'news' : `news/page/${n - 1}`)}">` : ''}${n < pages ? `<link rel="next" href="${canonical(locale, `news/page/${n + 1}`)}">` : ''}`,
        })}${payloadScript(newsPayload(locale, extra))}`,
        render(locale, route, newsFor(locale, extra)),
      ),
    );
    sitemapNews.push({
      locale,
      slug,
      lastmod: lastModified(list),
      links: n === 1 ? alternates('news', newsLocales) : [],
    });
    newsPages++;
  }

  for (const article of list) {
    const slug = `news/${article.slug}`;
    const route = routeFor(locale, slug);
    const url = canonical(locale, slug);
    const translations = alternatesFor(article, corpus);
    // Only real, published, reciprocal translations are declared. An article
    // without one declares no alternates at all.
    const versions = [{ locale, slug: article.slug }, ...translations];
    const links = translations.length
      ? [
          ...versions.map((t) => ({
            hreflang: localeMeta[t.locale].tag,
            href: canonical(t.locale, `news/${t.slug}`),
          })),
          ...versions
            .filter((t) => t.locale === DEFAULT_LOCALE)
            .map((t) => ({ hreflang: 'x-default', href: canonical(t.locale, `news/${t.slug}`) })),
        ]
      : [];
    const cover = article.seo.image ?? article.cover;
    const image = {
      url: absolute(cover.src),
      width: cover.width,
      height: cover.height,
      alt: cover.alt,
    };
    const author =
      article.author.kind === 'person'
        ? {
            '@type': 'Person',
            name: article.author.name,
            ...(article.author.url ? { url: article.author.url } : {}),
          }
        : { '@type': 'Organization', name: article.author.name, url: origin + '/' };
    // Every field below is shown on the page: headline, image, author, dates.
    const graph = [
      organization,
      website,
      {
        '@type': 'BlogPosting',
        '@id': url + '#article',
        mainEntityOfPage: url,
        headline: article.title,
        description: article.seo.description,
        image: [image.url],
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author,
        publisher: { '@id': origin + '/#organization' },
        inLanguage: localeMeta[locale].tag,
        isPartOf: { '@id': origin + '/#website' },
      },
      breadcrumb([
        [content.ui.page.home, canonical(locale, '')],
        [ui.label, canonical(locale, 'news')],
        [article.title, url],
      ]),
    ];
    const extra = {
      article: {
        article: toPublic(article),
        related: relatedFor(article, list),
        alternates: translations,
      },
    };
    await writePage(
      route,
      document(
        locale,
        `${preload}${baseHead({
          locale,
          title: article.seo.title,
          description: article.seo.description,
          url,
          noindex: article.seo.noindex,
          links: article.seo.noindex ? [] : links,
          ogType: 'article',
          ogLocales: translations.map((t) => t.locale),
          image,
          graph,
          extra: `<meta property="article:published_time" content="${article.publishedAt}"><meta property="article:modified_time" content="${article.updatedAt}">${feedLink}`,
        })}${payloadScript(newsPayload(locale, extra))}`,
        render(locale, route, newsFor(locale, extra)),
      ),
    );
    if (!article.seo.noindex) sitemapNews.push({ locale, slug, lastmod: article.updatedAt, links });
    newsPages++;
  }

  // Search reads the whole published corpus of the language, not a page of it.
  await mkdir(`${dist}${routeFor(locale, 'news')}`, { recursive: true });
  await writeFile(
    `${dist}${routeFor(locale, 'news')}search.json`,
    JSON.stringify(searchIndex(list)),
  );
  await writeFile(
    `${dist}${routeFor(locale, 'news')}feed.xml`,
    rssFeed(list, {
      origin,
      locale: localeMeta[locale].tag,
      title: ui.feed,
      description: ui.intro,
      link: canonical(locale, 'news'),
      self: feedUrl,
    }),
  );
}

/**
 * One not-found document for the whole site.
 *
 * The host serves it for every unknown address, in every language, so it is
 * written in the reference language and flagged as the fallback: the page then
 * switches to the language of the address in the browser, where the address is
 * finally known.
 */
const notFound = contentFor(DEFAULT_LOCALE).ui.notFound;
const missingPage = {
  slug: '404',
  label: notFound.metaLabel,
  title: notFound.metaTitle,
  description: notFound.metaDescription,
  noindex: true,
};
await writeFile(
  `${dist}/404.html`,
  document(
    DEFAULT_LOCALE,
    `${head(DEFAULT_LOCALE, missingPage)}${payloadScript(newsPayload(DEFAULT_LOCALE))}`,
    render(DEFAULT_LOCALE, routeFor(DEFAULT_LOCALE, '404'), newsFor(DEFAULT_LOCALE)),
    ' data-fallback="404"',
  ),
);

/** Every indexable page, in every language, with its language alternates. */
const indexed = indexable
  ? [
      ...LOCALES.flatMap((locale) =>
        contentFor(locale)
          .pages.filter((p) => !p.noindex)
          .map((p) => ({ locale, slug: p.slug, links: alternates(p.slug) })),
      ),
      ...sitemapNews,
    ]
  : [];
await writeFile(
  `${dist}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${indexed
    .map(
      ({ locale, slug, links, lastmod }) =>
        `<url><loc>${canonical(locale, slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${links
          .map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
          .join('')}</url>`,
    )
    .join('')}</urlset>`,
);

await writeFile(
  `${dist}/robots.txt`,
  `# AVYOR : ressources accessibles ; les previews portent noindex.\n# Aucun blocage arbitraire des robots de recherche IA.\nUser-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);

/** A plain-text summary per language, for readers that do not run JavaScript. */
for (const locale of LOCALES) {
  const content = contentFor(locale);
  const ui = content.ui.llms;
  const others = LOCALES.filter((l) => l !== locale)
    .map((l) => `[${localeMeta[l].label}](${canonical(l, '')})`)
    .join(', ');
  const articles = forLocale(corpus, locale).filter((a) => !a.seo.noindex);
  const news = articles.length
    ? `\n\n## ${content.ui.news.label}\n${articles
        .map((a) => `- [${a.title}](${canonical(locale, `news/${a.slug}`)}): ${a.excerpt}`)
        .join('\n')}`
    : '';
  await mkdir(`${dist}${routeFor(locale, '')}`.replace(/\/$/, '') || dist, { recursive: true });
  await writeFile(
    `${dist}${routeFor(locale, '')}llms.txt`,
    `# AVYOR\n\n> ${content.facts}\n\n${config.apple || config.google ? ui.stores : ui.storesPending}\n\n${ui.demo}\n\n## ${ui.pages}\n${content.pages
      .filter((p) => !p.noindex)
      .map((p) => `- [${p.label}](${canonical(locale, p.slug)}): ${p.description}`)
      .join('\n')}${news}\n\n${ui.languages} : ${others}\n\n${ui.contact} : ${config.email}\n`,
  );
}

await writeFile(
  `${dist}/build-meta.json`,
  JSON.stringify(
    {
      locales: [...LOCALES],
      defaultLocale: DEFAULT_LOCALE,
      routes: LOCALES.flatMap((locale) =>
        contentFor(locale).pages.map((p) => canonical(locale, p.slug)),
      ),
      news: {
        locales: newsLocales,
        articles: corpus.map((a) => canonical(a.locale, `news/${a.slug}`)),
      },
      indexable,
      indexed: indexed.map(({ locale, slug }) => canonical(locale, slug)),
    },
    null,
    2,
  ),
);

await writeFile(
  `${dist}/_headers`,
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/news/media/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);

/* ================================================ Liens profonds (.well-known) */

/*
 * Les deux fichiers que le téléphone télécharge avant d'autoriser AVYOR à
 * ouvrir une adresse du site. Ils sont écrits ici, depuis le contrat de
 * `src/config/deep-links.ts`, pour qu'ils ne puissent pas dériver des
 * réécritures ni des pages de repli.
 *
 * Contraintes qui les rendent muets quand elles ne sont pas tenues : 200 sans
 * redirection, `application/json`, aucune authentification. La redirection de
 * slash final de Vercel ne touche pas `/.well-known/` — le chemin contient un
 * point —, ce qui a été vérifié sur le domaine réel avant d'écrire ceci.
 */
await mkdir(`${dist}/.well-known`, { recursive: true });
await writeFile(
  `${dist}/.well-known/apple-app-site-association`,
  JSON.stringify(appleAppSiteAssociation(), null, 2),
);

const fingerprints = (process.env.AVYOR_ANDROID_SHA256 ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const android = assetLinks(fingerprints);
if (android)
  await writeFile(`${dist}/.well-known/assetlinks.json`, JSON.stringify(android, null, 2));
else
  console.warn(
    'Android : AVYOR_ANDROID_SHA256 absente, /.well-known/assetlinks.json n’est pas écrit.\n' +
      '  Empreinte SHA-256 de Google Play App Signing (Play Console ▸ Intégrité de l’app).\n' +
      '  Un fichier présent avec une mauvaise empreinte échoue en silence : mieux vaut aucun fichier.',
  );

await access(`${dist}/404.html`);
console.log(
  `${written} pages pré-rendues (${LOCALES.length} langues) + ${newsPages} pages News (${corpus.length} article${corpus.length > 1 ? 's' : ''} publié${corpus.length > 1 ? 's' : ''}) + 404. ${indexed.length} URL dans le sitemap.`,
);

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import {
  render,
  contentFor,
  config,
  introScript,
  LOCALES,
  DEFAULT_LOCALE,
  localeMeta,
  routeFor,
} from '../.ssr/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const origin = config.origin;
const indexable = config.indexable;
const font = (await readdir('dist/assets')).find(
  (name) => name.startsWith('manrope-latin-') && name.endsWith('.woff2'),
);
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

/** The absolute address of a page in one language. */
const canonical = (locale, slug) => origin + routeFor(locale, slug);

/**
 * Every language this page exists in, plus the default a search engine should
 * fall back to. Google requires the set to be reciprocal and to include the
 * page itself, so it is built from the same list the site is prerendered from.
 */
const alternates = (slug) => [
  ...LOCALES.map((locale) => ({ hreflang: localeMeta[locale].tag, href: canonical(locale, slug) })),
  { hreflang: 'x-default', href: canonical(DEFAULT_LOCALE, slug) },
];

function head(locale, page) {
  const content = contentFor(locale);
  const meta = localeMeta[locale];
  const url = canonical(locale, page.slug);
  const graph = [
    {
      '@type': 'Organization',
      '@id': origin + '/#organization',
      name: 'AVYOR',
      url: origin + '/',
      logo: origin + '/icon-512.png',
      email: config.email,
    },
    {
      '@type': 'WebSite',
      '@id': origin + '/#website',
      name: 'AVYOR',
      url: origin + '/',
      inLanguage: LOCALES.map((l) => localeMeta[l].tag),
      description: contentFor(DEFAULT_LOCALE).facts,
      publisher: { '@id': origin + '/#organization' },
    },
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
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: content.ui.page.home,
          item: canonical(locale, ''),
        },
        { '@type': 'ListItem', position: 2, name: page.label, item: url },
      ],
    });
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
  const links = page.noindex
    ? ''
    : alternates(page.slug)
        .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`)
        .join('');
  const ogAlternates = LOCALES.filter((l) => l !== locale)
    .map((l) => `<meta property="og:locale:alternate" content="${localeMeta[l].ogLocale}">`)
    .join('');
  return `<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="${indexable && !page.noindex ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${url}">${links}<meta name="theme-color" content="#0B1020"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta property="og:type" content="website"><meta property="og:site_name" content="AVYOR"><meta property="og:locale" content="${meta.ogLocale}">${ogAlternates}<meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${origin}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${origin}/og.png"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

/** The document shell, with the language it is written in on <html>. */
const document = (locale, headHtml, body, extraHtmlAttrs = '') =>
  template
    .replace(
      /<html[^>]*>/,
      `<html lang="${localeMeta[locale].tag}" dir="${localeMeta[locale].dir}"${extraHtmlAttrs}>`,
    )
    .replace('<!--head-->', headHtml)
    .replace('<!--app-->', body);

let written = 0;
for (const locale of LOCALES) {
  for (const page of contentFor(locale).pages) {
    const route = routeFor(locale, page.slug);
    const dir = `dist${route}`.replace(/\/$/, '') || 'dist';
    await mkdir(dir, { recursive: true });
    await writeFile(
      `${dir}/index.html`,
      document(
        locale,
        `${font ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin>` : ''}${head(locale, page)}${page.slug === '' ? `<script>${introScript}</script>` : ''}`,
        render(locale, route),
      ),
    );
    written++;
  }
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
  'dist/404.html',
  document(
    DEFAULT_LOCALE,
    head(DEFAULT_LOCALE, missingPage),
    render(DEFAULT_LOCALE, routeFor(DEFAULT_LOCALE, '404')),
    ' data-fallback="404"',
  ),
);

/** Every indexable page, in every language, with its language alternates. */
const indexed = indexable
  ? LOCALES.flatMap((locale) =>
      contentFor(locale)
        .pages.filter((p) => !p.noindex)
        .map((p) => ({ locale, slug: p.slug })),
    )
  : [];
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${indexed
    .map(
      ({ locale, slug }) =>
        `<url><loc>${canonical(locale, slug)}</loc>${alternates(slug)
          .map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
          .join('')}</url>`,
    )
    .join('')}</urlset>`,
);

await writeFile(
  'dist/robots.txt',
  `# AVYOR : ressources accessibles ; les previews portent noindex.\n# Aucun blocage arbitraire des robots de recherche IA.\nUser-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);

/** A plain-text summary per language, for readers that do not run JavaScript. */
for (const locale of LOCALES) {
  const content = contentFor(locale);
  const ui = content.ui.llms;
  const others = LOCALES.filter((l) => l !== locale)
    .map((l) => `[${localeMeta[l].label}](${canonical(l, '')})`)
    .join(', ');
  await mkdir(`dist${routeFor(locale, '')}`.replace(/\/$/, '') || 'dist', { recursive: true });
  await writeFile(
    `dist${routeFor(locale, '')}llms.txt`,
    `# AVYOR\n\n> ${content.facts}\n\n${config.apple || config.google ? ui.stores : ui.storesPending}\n\n${ui.demo}\n\n## ${ui.pages}\n${content.pages
      .filter((p) => !p.noindex)
      .map((p) => `- [${p.label}](${canonical(locale, p.slug)}): ${p.description}`)
      .join('\n')}\n\n${ui.languages} : ${others}\n\n${ui.contact} : ${config.email}\n`,
  );
}

await writeFile(
  'dist/build-meta.json',
  JSON.stringify(
    {
      locales: [...LOCALES],
      defaultLocale: DEFAULT_LOCALE,
      routes: LOCALES.flatMap((locale) =>
        contentFor(locale).pages.map((p) => canonical(locale, p.slug)),
      ),
      indexable,
      indexed: indexed.map(({ locale, slug }) => canonical(locale, slug)),
    },
    null,
    2,
  ),
);

await writeFile(
  'dist/_headers',
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);

console.log(
  `${written} pages pré-rendues (${LOCALES.length} langues) + 404. ${indexed.length} URL dans le sitemap.`,
);

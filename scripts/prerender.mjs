import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { render, pages, faqs, config, facts, introScript } from '../.ssr/entry-server.js';
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
const canonical = (slug) => `${origin}/${slug ? slug + '/' : ''}`;
function head(page) {
  const url = canonical(page.slug);
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
      inLanguage: 'fr',
      description: facts,
      publisher: { '@id': origin + '/#organization' },
    },
    {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name: page.title,
      description: page.description,
      inLanguage: 'fr',
      isPartOf: { '@id': origin + '/#website' },
    },
  ];
  if (page.slug && page.slug !== '404')
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: page.label, item: url },
      ],
    });
  if (page.slug === '' || page.slug === 'faq')
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((q) => ({
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
      description: facts,
    });
  return `<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="${indexable && !page.noindex ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${url}"><meta name="theme-color" content="#0B1020"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta property="og:type" content="website"><meta property="og:site_name" content="AVYOR"><meta property="og:locale" content="fr_FR"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${origin}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${origin}/og.png"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}
for (const page of pages) {
  const dir = `dist/${page.slug}`;
  await mkdir(dir, { recursive: true });
  await writeFile(
    `${dir}/index.html`,
    template
      .replace(
        '<!--head-->',
        `${font ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin>` : ''}${head(page)}${page.slug === '' ? `<script>${introScript}</script>` : ''}`,
      )
      .replace('<!--app-->', render(`/${page.slug ? page.slug + '/' : ''}`)),
  );
}
const missing = {
  slug: '404',
  label: 'Page introuvable',
  title: 'Page introuvable — AVYOR',
  description:
    'Cette page AVYOR est introuvable. Retrouvez les parcours Creators et marques depuis la page d’accueil.',
  noindex: true,
};
await writeFile(
  'dist/404.html',
  template.replace('<!--head-->', head(missing)).replace('<!--app-->', render('/404/')),
);
const indexed = pages.filter((p) => !p.noindex && indexable);
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexed.map((p) => `<url><loc>${canonical(p.slug)}</loc></url>`).join('')}</urlset>`,
);
await writeFile(
  'dist/robots.txt',
  `# AVYOR : ressources accessibles ; les previews portent noindex.\n# Aucun blocage arbitraire des robots de recherche IA.\nUser-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  'dist/llms.txt',
  `# AVYOR\n\n> ${facts}\n\n${config.apple || config.google ? 'Consultez la page de téléchargement pour les plateformes disponibles.' : 'Le lancement public se prépare. Aucun lien de store non vérifié n’est publié.'}\n\nLes captures contiennent des données de démonstration.\n\n## Pages officielles\n${pages
    .filter((p) => !p.noindex)
    .map((p) => `- [${p.label}](${canonical(p.slug)}): ${p.description}`)
    .join('\n')}\n\nContact : ${config.email}\n`,
);
await writeFile(
  'dist/build-meta.json',
  JSON.stringify(
    {
      routes: pages.map((p) => canonical(p.slug)),
      indexable,
      indexed: indexed.map((p) => canonical(p.slug)),
    },
    null,
    2,
  ),
);
await writeFile(
  'dist/_headers',
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);
console.log(`${pages.length} pages pré-rendues + 404. ${indexed.length} URL dans le sitemap.`);

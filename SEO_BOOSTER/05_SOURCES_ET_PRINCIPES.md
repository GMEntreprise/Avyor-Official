# Sources de référence et principes durables

Date de vérification : 24 août 2026. Réévaluer ces liens lors de toute évolution majeure des moteurs.

## Sources primaires

- Google Search Essentials : https://developers.google.com/search/docs/essentials
- Guide SEO Google : https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Contenu utile centré utilisateur : https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Contenu génératif : https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Fonctionnalités IA et sites : https://developers.google.com/search/docs/appearance/ai-features
- Guide d’optimisation IA Google : https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Données structurées : https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Politiques structured data : https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Mobile-first : https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
- Core Web Vitals : https://web.dev/articles/vitals
- FAQ OpenAI pour éditeurs/développeurs : https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- Politiques antispam Google : https://developers.google.com/search/docs/essentials/spam-policies
- Systèmes de classement Google : https://developers.google.com/search/docs/appearance/ranking-systems-guide
- Robots Anthropic : https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Robots Perplexity : https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Bing Webmaster Guidelines : https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- IndexNow : https://www.indexnow.org/documentation
- Schema.org : https://schema.org/docs/documents.html

## Ce que le moteur refuse de transformer en règle universelle

- Une densité de mots-clés de 1–2 %.
- Un minimum automatique de 1 500, 500 ou 300 mots.
- Un title obligatoirement limité à un nombre fixe de caractères.
- `changefreq` et `priority` comme accélérateurs de classement.
- `rel=prev/next` comme levier Google actuel.
- FAQ schema ajouté sur toutes les pages.
- « 25 % backlinks / 40 % contenu » ou toute pondération inventée des facteurs.
- Une longueur optimale universelle des passages pour les citations IA.
- La soumission IndexNow comme remplacement du crawl, des liens et des sitemaps.

## Hiérarchie des preuves

1. Documentation officielle et politiques du moteur.
2. Données propriétaires : Search Console, analytics, logs, conversions, tests terrain.
3. Expérimentation contrôlée sur cohortes.
4. Études tierces transparentes.
5. Avis d’outils/experts — hypothèses, jamais vérités algorithmiques.

## Révision

À chaque mise à jour : noter la date, la source, l’ancienne règle, la nouvelle règle et l’impact sur les codebases. Ne jamais appliquer silencieusement une recommandation qui modifie l’indexation ou les URLs.

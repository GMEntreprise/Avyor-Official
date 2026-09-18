/*
 * Les articles News livrés, dans les cinq langues du site.
 *
 * Un fichier par langue dans `news-articles/`, la même liste de familles dans
 * chacun : un article et ses traductions portent la même `family`. C'est de là
 * que sont déduits — dans les deux sens — les liens `translations`, que Google
 * ignore s'ils ne sont pas réciproques et qu'une main humaine finit toujours
 * par désaccorder.
 */
import { articles as fr } from './news-articles/fr.mjs';
import { articles as en } from './news-articles/en.mjs';
import { articles as es } from './news-articles/es.mjs';
import { articles as he } from './news-articles/he.mjs';
import { articles as ar } from './news-articles/ar.mjs';

const byLocale = { fr, en, es, he, ar };

/** family → { locale: id } */
const family = {};
for (const [locale, list] of Object.entries(byLocale))
  for (const spec of list) (family[spec.family] ??= {})[locale] = spec.id;

for (const [name, ids] of Object.entries(family))
  if (Object.keys(ids).length !== Object.keys(byLocale).length)
    throw new Error(
      `News : la famille « ${name} » manque dans ${Object.keys(byLocale)
        .filter((locale) => !ids[locale])
        .join(', ')}.`,
    );

export const articles = Object.entries(byLocale).flatMap(([locale, list]) =>
  list.map((spec) => ({
    ...spec,
    locale,
    article: {
      ...spec.article,
      translations: Object.fromEntries(
        Object.entries(family[spec.family]).filter(([other]) => other !== locale),
      ),
    },
  })),
);

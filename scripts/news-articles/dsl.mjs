/*
 * L'écriture des articles News : des fonctions qui décrivent un document,
 * pour que le texte reste lisible dans le fichier qui le porte.
 *
 * Un fichier par langue (`fr.mjs`, `en.mjs`, …), la même structure partout :
 * chaque article y déclare sa famille, son adresse et son contenu. Les liens
 * entre traductions ne sont pas écrits à la main — ils sont déduits de la
 * famille par `scripts/news-seed-articles.mjs`, dans les deux sens.
 */


export const t = (text, ...marks) => ({ type: 'text', text, ...(marks.length ? { marks } : {}) });
export const b = (text) => t(text, { type: 'bold' });
export const i = (text) => t(text, { type: 'italic' });
export const a = (text, href) => t(text, { type: 'link', attrs: { href } });
const inline = (parts) => parts.map((part) => (typeof part === 'string' ? t(part) : part));
export const p = (...parts) => ({ type: 'paragraph', content: inline(parts) });
/**
 * Un titre, et son ancre quand la langue ne peut pas en fabriquer une lisible :
 * une ancre se dérive du texte, ce qui ne donne rien d'utile en hébreu ou en
 * arabe. Là, l'ancre est écrite à la main, en latin, pour rester partageable.
 */
const heading = (level) => (text, id) => ({
  type: 'heading',
  attrs: { level, ...(id ? { id } : {}) },
  content: [t(text)],
});
export const h2 = heading(2);
export const h3 = heading(3);
const item = (entry) => ({
  type: 'listItem',
  content: [Array.isArray(entry) ? p(...entry) : p(entry)],
});
export const ul = (...items) => ({ type: 'bulletList', content: items.map(item) });
export const ol = (...items) => ({ type: 'orderedList', content: items.map(item) });
export const callout = (variant, ...content) => ({ type: 'callout', attrs: { variant }, content });
const cell = (type) => (value) => ({
  type,
  content: [Array.isArray(value) ? p(...value) : p(value)],
});
export const table = (head, ...rows) => ({
  type: 'table',
  content: [
    { type: 'tableRow', content: head.map(cell('tableHeader')) },
    ...rows.map((row) => ({ type: 'tableRow', content: row.map(cell('tableCell')) })),
  ],
});
export const doc = (...content) => ({ type: 'doc', content });


/** L'équipe éditoriale, nommée dans la langue de l'article — jamais une personne inventée. */
export const TEAM = {
  fr: { kind: 'organization', name: 'Équipe éditoriale AVYOR' },
  en: { kind: 'organization', name: 'AVYOR editorial team' },
  es: { kind: 'organization', name: 'Equipo editorial de AVYOR' },
  he: { kind: 'organization', name: 'צוות המערכת של AVYOR' },
  ar: { kind: 'organization', name: 'فريق التحرير في AVYOR' },
};

export const ACCESSED = '2026-09-18';

/*
 * Les sources restent dans leur langue officielle : un texte de loi française
 * se vérifie sur Légifrance, pas sur une traduction. Les articles écrits dans
 * une autre langue disent que la règle citée est française.
 */
export const LOI = {
  title: 'Loi n° 2023-451 du 9 juin 2023 visant à encadrer l’influence commerciale — article 5',
  url: 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000047663211',
  publisher: 'Légifrance',
  accessed: ACCESSED,
};
export const LOI_8 = {
  title: 'Loi n° 2023-451 du 9 juin 2023 — article 8 (contrat écrit)',
  url: 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000047663198',
  publisher: 'Légifrance',
  accessed: ACCESSED,
};
export const DECRET = {
  title:
    'Décret n° 2025-1137 du 28 novembre 2025 portant application de l’article 8 de la loi n° 2023-451',
  url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000052950561',
  publisher: 'Légifrance',
  accessed: ACCESSED,
};

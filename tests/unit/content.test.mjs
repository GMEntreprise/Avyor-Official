import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const meta = readFileSync('src/content/site.ts', 'utf8');
const bodies = readFileSync('src/content/sections.ts', 'utf8');
/** Everything a visitor can read, wherever it is stored. */
const source = meta + bodies;
/** The pages a visitor reads to understand the product, with their minimum depth. */
const depth = {
  creators: 8,
  brands: 8,
  features: 8,
  'how-it-works': 10,
  security: 8,
  download: 5,
  contact: 3,
};

const blocks = Object.fromEntries(
  bodies
    .split(/\n {2}(?=(?:'[a-z-]+'|[a-z][a-z0-9]*): \[)/)
    .slice(1)
    .map((block) => [block.match(/^'?([a-z0-9-]+)'?:/)[1], block]),
);

test('chaque page produit expose assez de sections pour répondre à son intention', () => {
  for (const [slug, minimum] of Object.entries(depth)) {
    const block = blocks[slug];
    assert.ok(block, `contenu absent pour : ${slug}`);
    const sections = block.split('title:').length - 1;
    assert.ok(sections >= minimum, `/${slug}/ : ${sections} sections pour ${minimum} attendues`);
  }
});

test('le site ne promet pas ce que l’application ne fait pas encore', () => {
  // L'app affiche « Authentification à deux facteurs — Bientôt disponible ».
  assert.doesNotMatch(source, /deux facteurs|2FA|double authentification/i);
  // Une candidature envoyée ne peut pas être retirée : le site doit le dire,
  // et surtout ne pas laisser croire l'inverse.
  assert.doesNotMatch(
    source,
    /(vous )?(pouvez|peut|pourrez) (l’|l'|la )?(annuler|retirer)[^.]{0,40}candidature/i,
  );
  assert.match(source, /candidature envoyée ne peut pas être retirée/i);
  // Le délai de virement dépend du calendrier Stripe : aucun chiffre promis.
  assert.doesNotMatch(source, /sous \d+ ?(jours?|heures?|h\b)|en \d+ ?jours? ouvr/i);
  assert.match(source, /dépend du calendrier/i);
});

test('aucun superlatif invérifiable (les démentis, eux, sont attendus)', () => {
  assert.doesNotMatch(
    source,
    /révolutionnaire|leader du marché|n°ª?\s?1\b|\bnuméro un\b|le meilleur\b|100 ?%|sans risque|instantané/i,
  );
  // « garanti » et « parfait » ne sont fautifs qu'affirmés, pas niés.
  assert.doesNotMatch(source, /(?<!aucun |n’est |n'est |jamais )\b(garanti|parfait)(e|s|es)?\b/i);
  // La réserve honnête sur les délais doit rester écrite noir sur blanc.
  assert.match(source, /Aucun délai n’est garanti/);
});

test('aucun chiffre de traction inventé', () => {
  // Pas de « 10 000 créateurs », « +250 marques », « 4,8/5 »…
  assert.doesNotMatch(
    source,
    /\b\d[\d  ]{2,}\+? (créateurs|creators|marques|utilisateurs|campagnes)\b/i,
  );
  assert.doesNotMatch(source, /\b\d[.,]\d\s*\/\s*5\b/);
  assert.doesNotMatch(source, /\+\s?\d+\s?(%|k\b|K\b)/);
});

test('les faits produit vérifiés dans l’app sont bien présents sur le site', () => {
  const facts = [
    /contre-offre/i, // la négociation se fait dans la conversation
    /conservée? par AVYOR|conservé par AVYOR/i, // les fonds sont retenus jusqu'à validation
    /trust score|score de confiance/i, // signal de matching réel
    /shortlist|présélection/i, // l'annonceur présélectionne
    /modèles?\b.*vidéo|modèles guidés/i, // aide à la création
    /missions?\b/i, // parcours : XP, missions, badges
  ];
  for (const fact of facts)
    assert.match(source, fact, `fait produit vérifié absent du site : ${fact}`);
});

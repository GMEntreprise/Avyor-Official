import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const legal = JSON.parse(readFileSync('src/content/legal.json', 'utf8'));
const docs = Object.entries(legal);

test('les trois documents existent et sont structurellement complets', () => {
  assert.deepEqual(
    docs.map(([slug]) => slug),
    ['privacy', 'terms', 'legal'],
  );
  for (const [slug, doc] of docs) {
    assert.ok(doc.title && doc.intro && doc.lastUpdated, slug);
    assert.ok(doc.sections.length >= 9, `${slug} reste trop court`);
  }
  assert.ok(legal.privacy.sections.length >= 20);
  assert.ok(legal.terms.sections.length >= 20);
});

test('chaque section porte une ancre stable, unique et lisible dans une URL', () => {
  for (const [slug, doc] of docs) {
    const ids = doc.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `ancres dupliquées dans ${slug}`);
    for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*$/, `${slug} : ancre « ${id} »`);
    for (const s of doc.sections) assert.ok(s.title.length > 3);
  }
});

test('une information juridique manquante est signalée, jamais inventée', () => {
  const todos = docs.flatMap(([slug, doc]) =>
    doc.sections.filter((s) => s.todo).map((s) => `${slug}#${s.id}`),
  );
  assert.ok(todos.length > 0, 'les données éditeur ne sont pas encore connues');
  const all = JSON.stringify(legal);
  // No fabricated corporate identity, registration number or address.
  assert.doesNotMatch(all, /\bSIRET\s*:?\s*\d/i);
  assert.doesNotMatch(all, /\b\d{3} ?\d{3} ?\d{3} ?\d{5}\b/);
  assert.doesNotMatch(all, /\b(SAS|SARL|SASU|EURL|SA)\b(?=[^»]*\d)/);
  assert.doesNotMatch(all, /\b\d{5}\s+[A-ZÉÈ][a-zéèêà-]+,?\s+France\b/);
  // Every section either states something verified or says what is missing.
  for (const [slug, doc] of docs)
    for (const s of doc.sections) assert.ok(s.body || s.todo, `${slug}#${s.id} est vide`);
});

test('aucune promesse de sécurité absolue (les réserves, elles, sont permises)', () => {
  const all = JSON.stringify(legal);
  assert.doesNotMatch(all, /\b(100 ?%|military[- ]grade|inviolable|zéro risque)\b/i);
  assert.doesNotMatch(
    all,
    /\b(?:est|sont|reste|restent)\s+(?:totalement|entièrement|parfaitement|toujours)\s+(?:sûr|sécuris)/i,
  );
  // The honest form is kept: security is described with its limits.
  assert.match(all, /Aucun système n’est infaillible/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuery, toSearch, withFilter, isFiltered, emptyQuery } from '../../src/news/query.ts';

test('l’état de la liste se relit depuis l’URL', () => {
  assert.deepEqual(parseQuery('?q=brief&audience=brands&theme=prepare&page=2'), {
    q: 'brief',
    audience: 'brands',
    theme: 'prepare',
    page: 2,
  });
});

test('une valeur inconnue est ignorée, jamais reprise telle quelle', () => {
  assert.deepEqual(parseQuery('?audience=<script>&theme=admin&page=-4'), emptyQuery);
  assert.equal(parseQuery('?page=abc').page, 1);
  assert.equal(parseQuery(`?q=${'x'.repeat(500)}`).q.length, 120);
});

test('l’URL ne garde que ce qui change quelque chose, dans un ordre fixe', () => {
  assert.equal(toSearch(emptyQuery), '');
  assert.equal(
    toSearch({ q: 'créer un brief', audience: '', theme: 'prepare', page: 1 }),
    '?q=cr%C3%A9er+un+brief&theme=prepare',
  );
  // Aller-retour sans perte.
  const query = { q: 'été', audience: 'creators', theme: 'create', page: 3 };
  assert.deepEqual(parseQuery(toSearch(query)), query);
});

test('changer de filtre ramène à la première page', () => {
  const next = withFilter({ q: 'a', audience: '', theme: '', page: 4 }, { theme: 'measure' });
  assert.equal(next.page, 1);
  assert.equal(next.theme, 'measure');
  assert.ok(isFiltered(next));
  assert.ok(!isFiltered(emptyQuery));
});

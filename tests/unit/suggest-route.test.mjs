import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestRoute } from '../../src/lib/suggest-route.ts';

const routes = [
  { slug: 'creators', label: 'Creators' },
  { slug: 'brands', label: 'Marques' },
  { slug: 'features', label: 'Produit' },
  { slug: 'how-it-works', label: 'Comment ça marche' },
  { slug: 'security', label: 'Sécurité' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'download', label: 'Télécharger' },
  { slug: 'contact', label: 'Contact' },
];

test('une faute de frappe mène à la bonne page', () => {
  assert.equal(suggestRoute('/creatrs/', routes), 'creators');
  assert.equal(suggestRoute('/downlaod/', routes), 'download');
  assert.equal(suggestRoute('/secutity', routes), 'security');
});

test('le nom français de la page suffit, avec ou sans accents ni majuscules', () => {
  assert.equal(suggestRoute('/marques/', routes), 'brands');
  assert.equal(suggestRoute('/Marques', routes), 'brands');
  assert.equal(suggestRoute('/sécurité/', routes), 'security');
  assert.equal(suggestRoute('/securite/', routes), 'security');
  assert.equal(suggestRoute('/telecharger/', routes), 'download');
  assert.equal(suggestRoute('/comment-ca-marche/', routes), 'how-it-works');
});

test('une sous-page inconnue renvoie vers sa section', () => {
  assert.equal(suggestRoute('/creators/ancien-profil/', routes), 'creators');
});

test('rien de proche : aucune suggestion plutôt qu’une devinette', () => {
  assert.equal(suggestRoute('/', routes), null);
  assert.equal(suggestRoute('/xyzabcdef/', routes), null);
  assert.equal(suggestRoute('/wp-admin/', routes), null);
  // Trop court pour être distingué de façon fiable.
  assert.equal(suggestRoute('/a/', routes), null);
});

test('une entrée hostile ne fait pas échouer la page', () => {
  assert.equal(suggestRoute('/%E0%A4%A/', routes), null);
  assert.equal(suggestRoute('/' + 'a'.repeat(5000), routes), null);
});

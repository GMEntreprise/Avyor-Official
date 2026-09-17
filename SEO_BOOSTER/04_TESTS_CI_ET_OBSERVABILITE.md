# Tests SEO, CI et observabilité

## Tests statiques à ajouter

- Chaque route indexable a title, description, canonical absolue et H1 non vide.
- Titles uniques par dataset de production ; doublons autorisés uniquement avec justification.
- Canonical utilise host/protocole/politique de slash officiels.
- Route noindex absente du sitemap ; toute URL sitemap répond 200 et ne redirige pas.
- Aucune URL admin/auth/preview/staging dans sitemap.
- JSON-LD se parse et respecte un schéma typé interne.
- Hreflang : réciprocité, code valide, URL 200/indexable.
- Redirections : absence de boucle, chaîne ou destination non canonique.
- Toutes les images de contenu ont dimensions ; alt vide pour décoratif, descriptif pour informatif.
- Aucun lien interne critique cassé et aucune page stratégique orpheline.

## Tests de rendu

Pour un échantillon de chaque template, récupérer l’HTML comme un crawler sans cookies. Vérifier que contenu, liens, meta et JSON-LD existent avant hydratation. Ajouter snapshots ciblés du `<head>` plutôt qu’un snapshot géant fragile.

Matrice minimale : accueil, page commerciale, listing, détail, article, catégorie, auteur, pagination, 404, page noindex et chaque langue.

## Budgets CI

Définir des budgets adaptés à la baseline, puis les resserrer : poids JS initial, nombre de requêtes, poids image LCP, score Lighthouse indicatif et régressions LCP/TBT/CLS de laboratoire. Un budget labo n’est pas une preuve CWV terrain.

Échec bloquant :

- page stratégique devenue noindex ou non canonique ;
- sitemap contenant URL privée/non-200 ;
- boucle de redirection ;
- JSON-LD invalide sur template critique ;
- contenu principal absent de l’HTML attendu ;
- régression de performance au-delà du budget approuvé.

## Monitoring production

- Quotidien : 5xx, disponibilité, robots/sitemap, certificat, changements noindex/canonical.
- Hebdomadaire : erreurs de crawl, rich results, pages stratégiques, redirections.
- Mensuel : Search Console, conversions, cannibalisation, CTR, CWV terrain, référents IA.
- Après déploiement/migration : contrôles à H+1, J+1, J+7 et J+30.

## Rapport de validation

```md
# Validation SEO — [commit/date]

## Environnement

## Commandes exécutées

## Résultats build/typecheck/lint/tests

## Crawl avant/après

## Routes et templates contrôlés

## Métadonnées/robots/sitemap/schema

## Performance laboratoire

## Données terrain disponibles

## Régressions détectées

## Limites et actions manuelles
```

Toute preuve doit être datée et reproductible. Ne pas masquer les tests non exécutés : les marquer `NON EXÉCUTÉ` avec la raison.

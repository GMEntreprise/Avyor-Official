# Scorecard d’audit SEO reproductible

## Échelle

- Critique : empêche l’accès, le rendu ou l’indexation, fuite d’environnement, action manuelle/spam.
- Haute : touche un template ou une conversion majeure.
- Moyenne : limite compréhension, présentation, maillage ou performance.
- Faible : amélioration utile mais non bloquante.

Statut : `PASS`, `FAIL`, `WARNING`, `N/A`, `UNKNOWN`. Toute ligne FAIL/WARNING exige une preuve.

## A. Crawl, indexation et rendu — 25 points

- [ ] Domaine/HTTPS/host uniques ; redirections en un saut.
- [ ] Statuts HTTP réels : 200/301/404/410, aucun soft 404.
- [ ] HTML initial contient contenu, liens et head critiques.
- [ ] Robots ne bloque ni pages stratégiques ni ressources de rendu.
- [ ] Noindex uniquement sur pages prévues ; aucun conflit canonical/sitemap.
- [ ] Sitemaps valides, ≤ 50 000 URL et 50 Mo non compressé chacun, URL canoniques 200 seulement.
- [ ] Canonical absolue, cohérente, auto-référente sur pages uniques.
- [ ] Paramètres, facettes, recherche, tri et sessions contrôlés.
- [ ] Pagination/infinite scroll dispose d’URL et liens crawlables.
- [ ] Profondeur et pages orphelines mesurées.

## B. Architecture, on-page et contenu — 25 points

- [ ] Chaque page vise une intention distincte et correspond au SERP réel.
- [ ] Title descriptif et unique ; longueur évaluée par rendu, pas quota rigide.
- [ ] Description unique et fidèle, conçue pour le clic sans promesse trompeuse.
- [ ] Un titre principal clair ; hiérarchie sémantique logique.
- [ ] Contenu visible, original, complet et directement utile.
- [ ] Cannibalisation et doublons identifiés.
- [ ] Ancres internes descriptives ; hubs/piliers et contenus supports.
- [ ] Auteurs, dates, sources, organisation/contact et politiques accessibles.
- [ ] Contenus obsolètes, faibles ou sans demande : améliorer, fusionner, noindex ou retirer selon preuve.
- [ ] CTA et conversion correspondent à l’intention.

## C. Données structurées et SERP — 15 points

- [ ] JSON-LD parsable, sans doublon contradictoire.
- [ ] Entités stables via `@id` et URLs absolues.
- [ ] Schema correspond au type et au contenu visible.
- [ ] Propriétés requises/recommandées disponibles et véridiques.
- [ ] Organization/WebSite globaux sans fausses données.
- [ ] BreadcrumbList reflète le fil visible.
- [ ] Product/Offer disponibilité/prix alignés à la source métier.
- [ ] Article auteur/date/image alignés.
- [ ] Validation Rich Results + Schema.org documentée.
- [ ] Open Graph/social preview par template.

## D. Performance, mobile et accessibilité — 15 points

- [ ] Données terrain CWV disponibles ou absence explicitée.
- [ ] LCP/INP/CLS au p75 segmentés mobile/desktop.
- [ ] Ressource LCP découvrable/prioritaire ; pas de lazy-load LCP.
- [ ] Images responsives, compressées, dimensions/rations réservées.
- [ ] JS critique limité ; longues tâches et tiers mesurés.
- [ ] Polices optimisées sans saut ; cache/CDN/compression corrects.
- [ ] Parité contenu/meta mobile-desktop.
- [ ] Navigation clavier, labels, contrastes et tap targets.

## E. International/local/médias — 10 points

- [ ] Langue HTML correcte ; variantes réellement traduites.
- [ ] Hreflang réciproques, URL indexables, canonical dans la même langue.
- [ ] NAP exact et cohérent pour local ; page/contact/zone réels.
- [ ] Google Business Profile et avis traités honnêtement.
- [ ] Vidéo/images ont pages/contexte, miniatures et métadonnées utiles.

## F. Mesure, sécurité et gouvernance — 10 points

- [ ] Search Console/Bing/analytics/conversions sans double tag.
- [ ] Consentement et confidentialité respectés.
- [ ] Aucun secret/token/PII dans HTML, repo, sitemap ou logs.
- [ ] Alertes indexation, 5xx, sitemap, CWV et conversions.
- [ ] Propriétaire, date de revue et journal des migrations.

## Format d’un constat

```md
### SEO-001 — [Titre]

- Sévérité : Critique | Haute | Moyenne | Faible
- Statut : FAIL
- Portée : URL/template concernés
- Preuve : commande, extrait, capture ou métrique reproductible
- Impact : mécanisme précis, sans spéculation
- Cause racine :
- Correction : fichier/configuration et comportement attendu
- Effort : S | M | L | XL
- Priorité calculée :
- Test d’acceptation : Given/When/Then ou commande exacte
- Responsable/date :
```

## Garde-fous de notation

Ne pas additionner des `UNKNOWN` comme des réussites. Publier le score global uniquement avec le taux de couverture : `points obtenus / points applicables`, plus `contrôles vérifiés / contrôles totaux`. Un score élevé ne remplace pas les conversions, l’indexation ou la qualité du contenu.

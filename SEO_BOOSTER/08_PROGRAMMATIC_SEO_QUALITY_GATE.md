# Programmatic SEO — Quality Gate

Une famille de pages n’est autorisée que si cinq conditions sont prouvées : motif de recherche répétable, intention distincte par URL, données spécifiques fiables, valeur autonome et capacité de maintenance/modération/retrait. Sinon : ne pas générer.

Créer `docs/seo/PSEO_SPEC.md` : source/licence, champs uniques, nombre d’URL, pattern, demande, template, différences fonctionnelles, seuil d’indexation, mise à jour, propriétaire, coût de crawl et retrait.

## États

- `DRAFT` : non publique.
- `PUBLIC_NOINDEX` : utile mais preuve SEO insuffisante.
- `INDEXABLE` : données complètes, uniques, validées et demandées.
- `STALE_NOINDEX` : obsolète en attente.
- `MERGE_301` : intention dupliquée.
- `GONE_410` : disparition définitive sans alternative.

## Unicité réelle

Ne pas mesurer seulement les mots différents. Exiger une différence d’information : inventaire local, prix réel, réglementation, disponibilité, intégration, exemples, comparaison, avis modérés, données ou outil. Remplacer ville, métier ou concurrent dans le même texte est une doorway page potentielle.

Comparaisons, alternatives, intégrations, personas, localités, glossaires, templates, exemples, statistiques, répertoires et outils ne sont autorisés que s’ils fonctionnent et possèdent des preuves spécifiques.

## Quality gate CI/data

- Dataset typé, source/licence connue, champs obligatoires.
- Aucun slug/canonical dupliqué.
- Seuil de complétude atteint.
- Page indexable reliée depuis un hub crawlable.
- Title/H1/corps non issus d’une simple substitution.
- Schema aligné au visible.
- Sitemap après validation seulement.
- Échantillonnage humain, canary 1–5 %, suivi 30 jours.
- Stop si soft 404, faible indexation persistante, aucune impression ou contenu erroné.

Publier par cohortes et comparer aux témoins. Ne jamais lancer 10 000 pages parce que le build le permet.

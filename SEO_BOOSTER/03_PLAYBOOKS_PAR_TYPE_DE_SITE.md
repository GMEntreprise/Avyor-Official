# Modules par type de site

N’activer que les modules pertinents.

## SaaS / application

- Pages distinctes : problème, solution, fonctionnalités, cas d’usage, intégrations réelles, tarifs, sécurité, alternatives/comparatifs honnêtes, documentation et changelog.
- Relier les articles éducatifs aux fonctionnalités capables de résoudre le problème.
- Indexer seulement la documentation publique stable ; noindex pour app, auth et états personnels.
- `SoftwareApplication` seulement si les propriétés sont réelles. Afficher clairement prix, essai, plateformes et support.
- KPI : démos/inscriptions qualifiées et activation, pas trafic seul.

## E-commerce

- Catégories utiles, produits uniques, variantes cohérentes, disponibilité et prix synchronisés.
- Contrôler facettes, tri, filtres, pagination et produits épuisés.
- `Product`, `Offer`, livraison/retour depuis la même source que l’UI ; avis authentiques seulement.
- Flux Merchant Center + structured data pour couverture maximale lorsque pertinent.
- Ne pas supprimer brutalement un produit ayant demande/liens : alternative, remplacement, 301 ou 410 selon cas.
- KPI : revenus organiques, marge, ajout panier, transactions, couverture Merchant.

## Blog / média / ministère / association

- Clusters thématiques, pages auteurs, mission/ligne éditoriale, sources et dates.
- `Article`/`BlogPosting`, images sociales, fil d’Ariane, RSS.
- Auditer archives de tags/catégories : indexer uniquement celles qui ont une valeur propre.
- Pour contenus bibliques/théologiques : références vérifiables, traduction citée, distinction interprétation/texte et auteur.
- KPI : abonnements, dons, lectures engagées, téléchargements, participation.

## Entreprise locale

- Une page établissement réelle par lieu ; pas de villes inventées ou doorway pages.
- NAP, horaires, services, zones et preuves locales cohérents avec le profil d’établissement.
- `LocalBusiness` du sous-type précis, carte et contact accessibles.
- Système honnête de demande/réponse aux avis ; jamais d’avis générés.
- Contenus locaux basés sur projets, équipe, réglementations et cas réels.
- KPI : appels, demandes d’itinéraire, formulaires, réservations qualifiées.

## Marketplace / annuaire / événements

- Définir seuil de qualité/indexation pour fiches ; noindex des fiches vides ou non validées.
- Gérer expiration, annulation, duplication et suppression ; `Event` synchronisé au statut visible.
- Catégories et localités uniquement si demande + inventaire + contenu distinct.
- Pagination crawlable, filtres contrôlés, cartes complétées par contenu HTML.
- Modération, identité organisateur, signalement et politique éditoriale.
- KPI : fiches valides, demandes, inscriptions, fraîcheur et couverture indexée utile.

## International

- Une URL stable par langue/pays ; pas de traduction automatique non relue sur pages stratégiques.
- Sélecteur de langue crawlable ; pas de redirection forcée bloquante par IP.
- Hreflang réciproque et canonical autonome dans chaque variante.
- Localiser devise, unités, juridique, exemples et recherche — pas seulement les mots.

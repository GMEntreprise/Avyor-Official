# AVYOR — Audit de contenu page par page

Réalisé en lisant l'application réelle (`/Users/shavod/Developer/Avyor`), notamment `src/i18n/resources/fr.json`, l'arborescence `app/(creator)` et `app/(advertiser)`, et `src/features/`. Chaque affirmation portée par le site doit pouvoir être retrouvée dans ces sources.

## Faits produit vérifiés — et sous-exploités par le site

| Domaine | Ce que fait réellement l'app | Le site en parlait ? |
| --- | --- | --- |
| Négociation | Le montant se discute **dans la conversation**, chaque partie pouvant faire une **contre-offre** | Non |
| Séquestre | Une fois la proposition acceptée, la somme est **conservée par AVYOR** jusqu'à validation du livrable | Non, seulement « financée » |
| Versement | 4 étapes suivies : paiement → livrable validé → versement sur le solde Stripe → virement bancaire | Partiellement |
| Matching | 6 signaux nommés : niche, plateformes cibles, taux d'engagement, localisation et langue, trust score, activité récente | « informations de compatibilité », sans détail |
| Campagne | Assistant en 4 étapes : Informations, Budget, Ciblage, Révision | Non |
| Modèles de paiement | Fixe, commission, mixte | Non |
| Ciblage | Plateformes, âge, genre, nombre d'abonnés, échéance | Non |
| Candidatures | 6 statuts : en attente, en cours d'examen, présélectionné, accepté, refusé, terminé | Non |
| Shortlist | L'annonceur peut présélectionner des Creators | Non |
| Création vidéo | Modèles guidés, 7 catégories, difficulté, nombre d'étapes, studio, choix de couverture | Non |
| Séries / Stories | Contenus épisodiques et stories thématiques | Non |
| Parcours | XP, niveaux, missions, badges, projets, chronologie | Une phrase |
| Statistiques | Vues, likes, enregistrements, abonnés, portfolio, campagnes | « statistiques » |
| Sécurité du compte | Mot de passe avec indicateur de robustesse, changement d'e-mail vérifié, sessions connectées, suppression définitive avec confirmation | Partiellement |
| Langues | L'application est traduite en 5 langues (fr, en, es, ar, he), avec prise en charge RTL | Non |
| Catégories | 19 niches définies | Non |

## À NE PAS affirmer

- **L'authentification à deux facteurs n'existe pas.** L'app affiche « Bientôt disponible ». Le site ne doit pas la présenter comme disponible.
- **Une candidature envoyée ne peut pas être retirée** depuis l'app. Ne pas laisser croire le contraire.
- Aucun délai de virement chiffré : il dépend du calendrier du compte Stripe.
- Le site est en français uniquement, même si l'app est multilingue.

## Page par page

### `/` Accueil
Hero clair, produit montré, parcours complet. **Conservée.** Manque seulement la négociation, ajoutée à la section confiance.

### `/creators/` — 4 sections
Répondait à « pourquoi AVYOR ». Ne disait rien de la **création assistée** (modèles, studio, séries, stories), des **statistiques**, ni de la **négociation**. → portée à 8 sections.

### `/brands/` — 4 sections
Ne décrivait ni l'**assistant de campagne**, ni les **modèles de paiement**, ni le **ciblage**, ni la **shortlist**, ni les **statuts de candidature**. → portée à 8 sections.

### `/features/` — 6 sections
Liste plate. Regroupée en **4 familles** (Découvrir, Créer, Collaborer, Piloter) conformes au vocabulaire de l'app. → 8 sections organisées.

### `/how-it-works/` — 4 sections
Mélangeait les deux parcours. Séparée en **deux parcours de 5 étapes**, alignés sur les écrans réels. → 10 sections + composant Workflow.

### `/security/` — 4 sections
Ne détaillait ni les **contrôles de compte réels**, ni les **motifs de signalement**, ni le **séquestre**. → 8 sections, sans mentionner la 2FA.

### `/faq/` — 7 questions
Les réponses existaient mais restaient générales. Alignées sur la FAQ interne de l'app et complétées. → 14 questions.

### `/download/` — 5 sections
Traitée au lot 6. **Conservée.**

### `/contact/` — 2 sections
Suffisante pour son intention. Complétée d'une section sur les signalements.

### `/privacy/`, `/terms/`, `/legal/`
Traitées aux lots 12 à 14. **Conservées.**

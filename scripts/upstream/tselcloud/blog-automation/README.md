# Blog automatique ConnectStar

Système de publication automatique d'un article de blog chrétien **toutes les 2 semaines**, avec garde-fous qualité, SEO et flux (sitemap + RSS) régénérés automatiquement.

## Vue d'ensemble

```
topics.json ──► generate.mjs ──► (LLM Claude) ──► quality-gates.mjs
                                                        │
                              échec ─────────────────────┤ (brouillon dans drafts/, rien publié)
                                                        │
                              succès ► src/data/generated/posts.json ──► blog.ts ──► site
                                       published-log.json (journal/anti-doublon)
                                       generate-feeds.mjs ──► public/sitemap.xml + public/rss.xml
```

- Les articles manuels restent dans `src/data/blog.ts`.
- Les articles générés sont stockés dans `src/data/generated/posts.json` et fusionnés au runtime par `blog.ts`. **Aucune modification de code n'est nécessaire pour publier.**

## Fichiers

| Fichier                                       | Rôle                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `topics.json`                                 | Banque de sujets (rotation). Ajoutez-en librement. `id` unique et stable. |
| `published-log.json`                          | Journal des générations publiées (audit + anti-doublon par `topicId`).    |
| `quality-gates.mjs`                           | Contrôles qualité non négociables (voir plus bas).                        |
| `generate.mjs`                                | Génère un article, applique les garde-fous, publie ou écrit un brouillon. |
| `drafts/`                                     | Brouillons (mode `--dry-run` ou échec qualité). Non versionné.            |
| `../generate-feeds.mjs`                       | Régénère le bloc blog du sitemap + le flux RSS depuis `blog.ts`.          |
| `../../.github/workflows/blog-automation.yml` | Planification bimensuelle + Pull Request de validation.                   |

## Variables d'environnement requises

| Variable            | Où                                             | Description                          |
| ------------------- | ---------------------------------------------- | ------------------------------------ |
| `ANTHROPIC_API_KEY` | Local (`.env` non commité) / GitHub **Secret** | Clé API Claude. **Jamais en dur.**   |
| `BLOG_LLM_MODEL`    | optionnel — GitHub **Variable**                | Modèle (défaut : `claude-opus-4-8`). |

Installer la dépendance LLM (déjà en `devDependencies`) : `bun install`.

## Commandes

```bash
# Brouillon de test, ne publie rien (recommandé avant d'activer le cron)
bun run blog:dry-run

# Génère + publie l'article suivant (à lancer sur une branche, pas sur main)
bun run blog:generate

# Forcer un sujet précis
node scripts/blog-automation/generate.mjs --topic=donnees-pas-a-vendre

# Régénérer manuellement sitemap + RSS (après un article manuel par ex.)
bun run generate:feeds
```

## Stratégie SEO (câblée dans le pipeline)

Le but : capter le trafic de recherche de gens qui **ne connaissent pas encore** ConnectStar (intention informationnelle : « comment prier quand on n'y arrive plus »), pas la marque. Chaque sujet porte :

- un **pilier** éditorial (`pillar`) qui impose sa structure H2 : `foi_concrete` · `fonctionnalite` · `comparatif` · `securite` · `communaute` ;
- une **catégorie** de taxonomie du site (`category`) : `foi` · `fonctionnalites` · `nouveautes` · `communaute` · `securite` ;
- un `keyword_principal`, des `keywords_secondaires` et des `longue_traine`.

Rotation recommandée (l'ordre de `topics.json` la suit) : `foi_concrete → fonctionnalite → comparatif → foi_concrete → securite → foi_concrete → communaute → fonctionnalite …` (≈ 40 % foi, 25 % fonctionnalité, 15 % comparatif, 10 % sécurité, 10 % communauté).

Le **prompt MASTER** (voix de marque) est envoyé en `system` à chaque génération : phrases courtes, ouverture par une scène vécue, Jésus nommé ≥ 2×, mot hébreu/grec expliqué, **liste noire de tics « IA »**, maillage interne obligatoire. La structure détaillée par pilier est injectée dans le message utilisateur (cf. `PILLAR_BLOCKS` dans `generate.mjs`).

## Garde-fous qualité (non négociables)

Un article qui échoue **n'est jamais écrit** dans `posts.json` (un brouillon est laissé dans `drafts/` pour inspection). Un garde-fou qui **bloque** (erreur) vs qui **alerte** (warning) :

**Erreurs (bloquantes) :**

1. **Longueur** — corps ≥ 900 mots, titre 20–120 car., meta description 70–220 car.
2. **Verset biblique** — au moins une référence (ex. `Jean 3:16`) **et** une version reconnue (ex. `Louis Segond`).
3. **Pas de fausse promesse technique** — bannit « 100% sécurisé », « impossible à pirater », « sécurité absolue », etc.
4. **Slug unique** — vérifié contre tous les articles existants (`blog.ts`).
5. **Anti-doublon** — un `topicId` déjà publié est refusé.
6. **Champs** — slug kebab-case, catégorie valide, ≥ 2 tags.
7. **Christocentrisme** — « Jésus »/« Christ » cité ≥ 2 fois.
8. **Anti-robotique** — bannit « dans le monde d'aujourd'hui », « il est important de noter », « en conclusion », etc.
9. **Maillage interne** — au moins 1 lien `[ancre](/blog/slug)` vers un article **existant** (slug cassé = refus).

**Avertissements (non bloquants, à relire) :** sensationnalisme, titre > 60 car., meta description hors 150–160 car., mot-clé absent des 100 premiers mots, < 2 H2 avec variante du mot-clé, densité mot-clé hors 1–3 %.

## Planification (mode recommandé : brouillon + PR)

La GitHub Action `blog-automation.yml` :

1. s'exécute **les 1er et 15** de chaque mois (~ toutes les 2 semaines) — `cron: "0 9 1,15 * *"` ;
2. génère l'article sur une **branche** et ouvre une **Pull Request** ;
3. **fusionner la PR publie l'article** (sitemap + RSS déjà régénérés).

C'est la validation humaine « en 1 clic » exigée par la charte. Avant fusion : relecture théologique/factuelle + ajout de l'image de couverture `public/assets/blog/<slug>.webp`.

### Activer / désactiver / relancer

- **Activer** : ajouter le secret `ANTHROPIC_API_KEY` au dépôt GitHub (Settings → Secrets and variables → Actions). Le cron tourne ensuite tout seul.
- **Désactiver** : commenter le bloc `schedule:` dans le workflow, ou désactiver le workflow dans l'onglet _Actions_.
- **Relancer / tester** : onglet _Actions_ → _Blog automatique_ → _Run workflow_ (option `dry_run` pour un test sans publication, ou `topic` pour forcer un sujet).

## Ajouter un sujet

Ajoutez un objet au tableau `topics` de `topics.json`. Lancez d'abord le **PROMPT KEYWORD** (cf. `docs`/mémoire projet) pour trouver une requête à réelle intention de recherche, puis :

```json
{
  "id": "mon-sujet-unique",
  "pillar": "foi_concrete",
  "category": "foi",
  "title": "Titre < 60 car. contenant le mot-clé",
  "keyword_principal": "requête réellement tapée dans Google",
  "keywords_secondaires": ["variante-1", "variante-2", "variante-3", "variante-4"],
  "longue_traine": ["phrase longue réelle 1", "phrase longue réelle 2"],
  "angle": "Pour qui, quelle tension, quel exercice concret, quelle ancre biblique."
}
```

- `pillar` ∈ `foi_concrete | fonctionnalite | comparatif | securite | communaute` (impose la structure).
- `category` ∈ `foi | fonctionnalites | nouveautes | communaute | securite` (taxonomie du site).
- Champs additionnels selon le pilier : `feature` (fonctionnalité), `competitor` (comparatif), `sujet` (sécurité).
- Placez le sujet à sa position dans la rotation (l'ordre du tableau = ordre de publication).

## Image de couverture

Chaque article référence `/assets/blog/<slug>.webp` (utilisé pour le flux RSS et l'Open Graph). Ajoutez l'image optimisée (WebP) avant de fusionner la PR. En son absence, l'article reste fonctionnel (le visuel d'en-tête est un mockup généré côté front).

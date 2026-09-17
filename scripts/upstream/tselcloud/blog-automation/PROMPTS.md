# Système de prompts SEO — Blog ConnectStar

Référence canonique de la stratégie éditoriale/SEO du blog automatique. Le **PROMPT MASTER** et les **structures par pilier** sont déjà codés dans `generate.mjs` (`SYSTEM_PROMPT` + `PILLAR_BLOCKS`) — ce fichier documente le raisonnement et fournit les deux prompts **manuels** qui encadrent la génération : le PROMPT KEYWORD (avant d'ajouter un sujet) et le PROMPT QA (relecture optionnelle avant fusion de la PR).

Objectif : un article tous les 14 jours qui **capte le trafic de gens qui ne connaissent pas encore ConnectStar** (intention de recherche réelle), sonne humain et christocentrique, et vise le rang 1 — pas juste la marque.

---

## 1. PROMPT KEYWORD (manuel — à lancer avant d'ajouter un sujet à `topics.json`)

Colle ceci dans un chat Claude, remplace `{PILIER}`, récupère le JSON, crée l'entrée `topics.json`.

```
Tu es stratège SEO spécialisé dans les requêtes françaises liées à la foi chrétienne, la prière et les applications de messagerie/communauté religieuse.

Contexte : ConnectStar est une application de messagerie chrétienne (alternative à WhatsApp) avec Bible intégrée (plus de 60 versions YouVersion), chaînes de prière, chiffrement de bout en bout, Cartes Verset, Passion du Jour (dévotion quotidienne), Parcours de Lecture, Soaking & Présence (audio d'adoration). Gratuite. Fondée par Édouard Georges-Michel.

Pilier du cycle : {PILIER}  (foi_concrete | fonctionnalite | comparatif | securite | communaute)

Donne-moi :
1. Une requête cible principale — intention informationnelle ou comparatif, PAS une requête de marque (« ConnectStar avis »). Je veux capter du trafic qui ne connaît pas encore ConnectStar.
2. 4 mots-clés secondaires sémantiquement liés.
3. 6 à 8 variantes longue traîne réellement tapées dans Google (« comment prier quand on n'y arrive plus », pas « techniques de prière efficaces »).
4. Un titre (H1) de moins de 60 caractères contenant la requête principale et donnant envie de cliquer.
5. Un angle éditorial en une phrase : pour qui, quelle tension, quel exercice concret, quelle ancre biblique.

Réponds en JSON strict :
{ "keyword_principal": "...", "keywords_secondaires": ["..."], "longue_traine": ["..."], "titre_propose": "...", "angle_editorial": "..." }
```

Reporte le résultat dans `topics.json` (champs : `id, pillar, category, title, keyword_principal, keywords_secondaires, longue_traine, angle` + `feature`/`competitor`/`sujet` selon le pilier).

---

## 2. PROMPT MASTER + structures par pilier

**Déjà implémentés** dans `generate.mjs` :

- `SYSTEM_PROMPT` = voix de marque (phrases courtes, ouverture par une scène, Jésus ≥ 2×, mot hébreu/grec, liste noire de tics IA, maillage interne, format Markdown).
- `PILLAR_BLOCKS[pillar]` = structure H2 imposée + longueur cible, avec substitution de `{KW}`, `{FEATURE}`, `{COMPETITOR}`, `{SUJET}`.
- Les slugs existants sont injectés automatiquement pour le maillage interne (`[ancre](/blog/slug)`).

Pour modifier la voix ou une structure, éditer ces constantes — ne pas dupliquer le prompt ailleurs.

Rappel des piliers → catégories : `foi_concrete→foi`, `fonctionnalite→fonctionnalites`, `comparatif→communaute`, `securite→securite`, `communaute→communaute`.

---

## 3. PROMPT QA / SEO SCORE (manuel — relecture optionnelle avant de fusionner la PR)

Les garde-fous automatiques (`quality-gates.mjs`) bloquent déjà l'essentiel. Pour un audit humain approfondi d'un brouillon, colle l'article + ceci :

```
Tu es un auditeur SEO et éditorial strict. Voici un article du blog ConnectStar : {ARTICLE_JSON}
Mot-clé principal : {KEYWORD}

Vérifie, corrige si besoin, puis renvoie l'article corrigé en entier (même JSON) :

1. SEO technique — Titre < 60 car. contenant le mot-clé ? Meta 150–160 car. incitative ? Mot-clé dans les 100 premiers mots ? ≥ 2 H2 avec variante ? Densité 1–3 % (calcule-la) ? Slug court en kebab-case ? ≥ 1 lien interne Markdown ?
2. Contenu robotique — signale et reformule toute phrase interchangeable avec n'importe quel autre blog chrétien, toute transition béquille (« de plus », « par ailleurs » > 2×), toute promesse vague sans action concrète.
3. Vérité biblique — chaque citation correctement référencée (livre, chapitre, verset, version) ? Aucune affirmation théologique non consensuelle présentée comme un absolu ?
4. Note /100 (SEO /40, Voix /30, Rigueur biblique /20, Lien produit naturel /10). Si < 80, corrige directement le contenu avant de répondre.

Réponds uniquement avec le JSON final corrigé, prêt à publier.
```

---

## 4. Schéma de sortie (`BlogPost`)

L'article généré est assemblé par `generate.mjs` au format `BlogPost` (`src/data/blog.ts`) :
`slug, title, description, content (Markdown), category, tags, author, authorRole, datePublished, dateModified, readingTime, image (/assets/blog/<slug>.webp), imageAlt, featured`.
Le LLM ne produit que : `title, slug, description, tags, readingTime, imageAlt, content` — le reste est injecté par le script (catégorie = celle du topic, dates = jour réel).

## 5. Après fusion de la PR

1. Ajouter l'image de couverture `public/assets/blog/<slug>.webp`.
2. `bun run generate:feeds` est déjà lancé par le pipeline (sitemap + RSS à jour).
3. Le maillage interne est bidirectionnel : `getRelatedPosts` (catégorie/tags) s'affiche en bas de chaque article, + les liens Markdown insérés dans le corps.

# Visibilité dans les moteurs IA — GEO/AEO responsable

## Principe

Les moteurs IA ne disposent pas d’un bouton magique de classement. La meilleure base reste : contenu accessible, utile, original, attribuable, stable et soutenu par une entité crédible. Les optimisations pour Google AI Overviews/AI Mode suivent les fondamentaux Search ; la visibilité ChatGPT Search nécessite notamment de ne pas bloquer OAI-SearchBot si le propriétaire souhaite être découvert.

## Architecture de contenu citable

Pour chaque question importante :

1. titre explicite formulé dans le langage de l’utilisateur ;
2. réponse courte autonome immédiatement sous le titre ;
3. développement avec contexte, méthode, limites et exemples ;
4. preuve originale : données, capture, test, expérience, étude de cas ou citation primaire ;
5. date, auteur/relecteur et politique de mise à jour ;
6. liens vers les sources et pages d’entités ;
7. prochaine question logique via maillage interne.

Ne pas forcer une taille de passage (par exemple 134–167 mots) : aucune longueur ne garantit une citation. Favoriser les paragraphes cohérents, listes et tableaux lorsque le format aide réellement.

## Signaux d’entité

- Nom de marque, organisation, auteurs, produits et lieux écrits de manière constante.
- Pages À propos, auteurs, contact, méthodologie, politique éditoriale et corrections.
- `Organization`/`Person`/`Product` avec `@id` stable et `sameAs` uniquement vers les profils officiels.
- Claims importants reliés à des sources primaires datées.
- Distinction nette entre fait, opinion, estimation et témoignage.

## Robots et contrôle éditorial

Exemple à adapter, jamais à copier sans décision :

```txt
User-agent: OAI-SearchBot
Allow: /

# Choix indépendant concernant l'entraînement :
User-agent: GPTBot
Disallow: /
```

Documenter dans `docs/seo/AI_CRAWLER_POLICY.md` : agent, objectif, décision, propriétaire, date, justification. Ne pas utiliser `llms.txt` comme substitut à robots, sitemap, HTML et liens ; le considérer expérimental tant qu’aucun moteur ciblé ne le rend obligatoire.

## Mesure

- Référents IA et paramètres UTM, pages d’entrée, conversions assistées.
- Jeu de 20–50 requêtes stratégiques, testé mensuellement de manière reproductible.
- Présence, lien cité, exactitude du résumé, concurrents cités, sentiment et date.
- Ne pas automatiser des requêtes en violation des conditions des services.
- Conserver captures/date/modèle/pays : les réponses sont variables et personnalisables.

## Anti-patterns

- Pages « What is X? » clonées sans expertise.
- Fausses statistiques ou citations circulaires.
- FAQ artificielles et centaines de pages géographiques quasi identiques.
- Schema gonflé ou contenu caché.
- Réécriture d’articles concurrents sans valeur originale.
- Déclaration de succès sur une citation ponctuelle.

## Checklist GEO

- [ ] Le sujet et l’entité sont compris sans contexte externe.
- [ ] La réponse principale est visible dans l’HTML.
- [ ] Les affirmations ont preuve/source/date.
- [ ] L’auteur et l’éditeur sont vérifiables.
- [ ] Le lien canonique est stable et partageable.
- [ ] La page offre une information originale.
- [ ] Le robot de recherche ciblé est autorisé selon la politique choisie.
- [ ] Le trafic et les conversions IA sont mesurables.

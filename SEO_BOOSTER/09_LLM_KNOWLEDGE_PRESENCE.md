# Présence de marque dans les LLM et moteurs de réponse

## Modèle réaliste

On ne soumet pas une marque à tous les LLM pour la rendre connue instantanément. Certains utilisent un index web, des partenaires de recherche ou des données d’entraînement datées. Agir sur quatre surfaces : découvrabilité web, sources tierces crédibles, cohérence d’entité et mesure.

## Carte des robots

Créer `docs/seo/AI_CRAWLER_POLICY.md` depuis la documentation officielle à jour. Distinguer recherche, visite utilisateur et entraînement. Vérifier OAI-SearchBot/GPTBot, ClaudeBot, PerplexityBot/Perplexity-User, Googlebot et Google-Extended. Autoriser ne garantit pas une citation ; bloquer l’entraînement est un choix distinct du blocage de recherche.

## Knowledge packet public

Pages humaines et crawlables : À propos, presse, produit, fonctionnalités, sécurité/confidentialité, auteurs/dirigeants, études/cas, documentation, FAQ réelles et changelog.

Centraliser dans `BRAND_FACTS.yml` : nom canonique, variantes, description, catégorie, éditeur, lancement, plateformes, pays, langues, prix, stores, profils et politiques. Générer contenu/schema depuis ces faits lorsqu’approprié avec validation humaine. Ne rien inventer ni exposer de sensible.

## Cohérence externe

Aligner stores, profils sociaux, partenaires, presse, annuaires sectoriels fiables et podcasts. Corriger contradictions. Obtenir des mentions indépendantes par PR réelle ; dupliquer le même communiqué n’établit pas l’autorité.

## llms.txt

Facultatif et expérimental. Il peut cartographier les ressources pour les systèmes qui le lisent mais ne remplace ni HTML, robots, sitemap, schema, liens ni autorité. S’il existe : faits concis, URL canoniques, documentation et date ; aucune page privée ni promesse.

## Benchmark

Tester questions de marque, catégorie, comparaison, fonctions, confiance et recommandation. Pour chaque moteur/modèle/pays/date/session : présence, place dans la réponse, lien/citation, exactitude, sources et concurrents. Répéter formulations et sessions ; rapporter un taux, jamais une capture isolée.

## Hallucinations et KPI

Identifier le fait faux et sa source probable. Corriger incohérences officielles et tierces, publier une source claire, demander correction si possible. Ne pas bourrer le web de texte identique.

Mesurer part de présence, taux de citation/lien, exactitude, trafic IA, conversions, mentions tierces et délai de correction, avec les limites de volatilité/personnalisation.

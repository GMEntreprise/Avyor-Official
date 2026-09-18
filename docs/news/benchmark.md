# Benchmark éditorial — ce que font les autres, et ce qu’on en retient

Observations faites le **18 septembre 2026**, sur les contenus publics consultés ce jour-là. Elles portent sur ce qui est visible : structure, rubriques, mise en forme, parcours vers le produit. **Aucune donnée de trafic, de classement ou de conversion n’a été mesurée** — ces chiffres ne sont pas publics, et les inventer n’aiderait personne.

Constat = ce qui a été vu. Hypothèse = l’intention supposée. Recommandation = ce que nous en faisons, à notre manière. Aucun texte, visuel ou donnée n’a été copié.

---

## Modash — blog

**Index** : <https://www.modash.io/blog> · **Article ouvert** : <https://www.modash.io/blog/influencer-engagement-rate>

**Constat.** L’index est organisé par rubriques métier (stratégie, canaux, relations, outils, mesure, recrutement…) avec une recherche, des sous-catégories mises en avant, et des cartes portant un auteur nommé, une date et une catégorie. Pas d’extrait ni de temps de lecture sur les cartes. L’article ouvert porte trois contributeurs identifiés avec leur fonction, une date de publication, un sommaire replié en haut, des titres de section formulés en questions, des encadrés de citations d’experts avec avatar, des tableaux de repères, des listes de signaux d’alerte, et un encart produit en fin d’article. Les affirmations chiffrées renvoient à leurs propres enquêtes et outils ; il n’y a pas de bibliographie externe.

**Hypothèse.** L’autorité est portée par des personnes nommées et par des données maison, ce qui suppose une équipe et un produit qui produit ces données.

**Recommandation pour AVYOR.** Reprendre l’organisation par problème plutôt que par mot-clé, et les titres de section qui posent la question du lecteur. Ne pas reprendre l’appareil de « citations d’experts » tant qu’aucun expert réel n’a accepté d’être cité : une équipe éditoriale identifiée comme organisation vaut mieux qu’un faux visage.

---

## Insense — exemple de brief UGC

**Article** : <https://insense.pro/blog/ugc-brief> · **Modèle** : <https://help.insense.pro/article/4227>

**Constat.** L’article annonce un auteur avec sa fonction, une date, un temps de lecture (9 minutes), un sommaire latéral collant, un résumé en tête, une progression « quoi / pourquoi ça échoue / comment faire / modèle / erreurs fréquentes / produit / questions », et des comparaisons avant-après d’un même passage de brief. Le modèle publié dans leur base de connaissances est très concret : objectifs et livrables chiffrés, contexte de marque, direction créative, contraintes de tournage (format 9:16, lumière, tenue, décor), à faire et à ne pas faire, script minuté, liste de plans, variantes d’appel à l’action, droits d’usage et délai.

**Limite visible.** Sur la page consultée, le sommaire latéral affichait des entrées de gabarit (« Example H2 », « H3 »…) au lieu des sections réelles — un sommaire qui ne suit pas le contenu qu’il annonce. C’est exactement ce que notre implémentation rend impossible : nos entrées sont dérivées des titres rendus.

**Hypothèse.** Le format « modèle téléchargeable » sert autant l’utilité que la collecte de contacts.

**Recommandation pour AVYOR.** Donner l’exemple **dans la page**, sans formulaire : un lecteur doit pouvoir repartir avec la méthode sans laisser son adresse. Reprendre le principe de la comparaison avant-après, qui montre la décision plutôt que de la décrire.

---

## Collabstr — blog

**Index** : <https://collabstr.com/blog>

**Constat honnête : le site refuse les lectures automatisées** (HTTP 403 sur l’index et sur les articles testés, le 18 septembre 2026). Les seuls éléments observés sont des titres et adresses remontés par la recherche — par exemple « How to Work With UGC Creators », « How to Become a UGC Creator », des comparaisons de plateformes. **Aucune observation de structure, de sommaire ou de mise en forme n’a pu être faite**, et rien n’en est déduit ici.

**Recommandation pour AVYOR.** Le seul enseignement défendable tient à la répartition des sujets visible dans ces titres : des contenus séparés pour les marques et pour les créateurs, dans un même espace. C’est la distinction public/thématique que nous avons retenue.

---

## Trois améliorations prioritaires pour AVYOR

| Priorité | Amélioration | Bénéfice attendu | Effort | Comment le vérifier |
| --- | --- | --- | --- | --- |
| 1 | **Un outil de décision par article** (exemple annoté, grille, liste à vérifier) plutôt qu’un conseil général | Le lecteur repart avec quelque chose d’utilisable ; l’article se distingue d’un contenu interchangeable | Faible : c’est une contrainte d’écriture, déjà vérifiée par un test | `tests/unit/news-articles.test.mjs` exige un tableau ou un encadré par article |
| 2 | **Le sommaire dérivé du contenu**, avec des ancres stables et partageables | Une section se partage par lien et reste atteignable après une retouche du titre ; le défaut observé chez Insense devient impossible | Moyen : fait | `tests/seo/news-html.test.mjs` vérifie que chaque entrée mène à une section existante |
| 3 | **Des sources primaires datées** pour toute règle qui change (droit, obligations) | Fiabilité vérifiable, et article maintenable : on sait quoi revérifier | Faible par article | Un test exige une source Légifrance datée dès qu’une loi ou un décret est cité |

## Ce que nous ne reprenons pas

- Les popups et fenêtres d’intention de sortie : le lecteur doit pouvoir lire sans être interrompu.
- Les compteurs d’audience et témoignages en tête d’article tant qu’aucun cas réel n’existe.
- Les modèles réservés contre une adresse e-mail.
- Les chiffres de marché repris d’un article à l’autre sans source primaire.

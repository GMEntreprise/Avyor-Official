# Ligne éditoriale News

**But d’un article : aider une marque ou un Creator à résoudre un problème concret.** Le référencement sert cette utilité ; il ne justifie jamais d’écrire plus.

## Structure

- **Section unique** : « News ». Sous-titre : *Des conseils concrets pour mieux collaborer. Les nouveautés AVYOR pour avancer.*
- **Types** : guide pratique · nouveauté AVYOR · retour d’expérience.
- **Publics** : marques · Creators · les deux.
- **Thématiques** : préparer une collaboration · créer du contenu · choisir un partenaire · suivre les résultats.

Une thématique n’apparaît comme filtre que si elle a au moins un article. Un **retour d’expérience** ne se publie qu’à partir d’un cas réel, avec l’accord de la personne ou de la marque concernée. Une **nouveauté AVYOR** ne se publie que pour une fonctionnalité livrée et vérifiée dans l’application.

## Manière d’écrire

- Un public principal par article, choisi avant d’écrire. Vouvoiement.
- L’introduction nomme une situation reconnaissable, montre ce qui bloque, puis **donne la réponse centrale en gras**. Les nuances viennent ensuite.
- Un terme de métier s’explique à son premier usage. UGC : un contenu créé par un Creator pour une marque, que la marque publie sur ses canaux — différent d’une publication d’influence, diffusée par le Creator à sa propre audience.
- Le gras signale une décision ou une idée à retenir, jamais un paragraphe entier. L’italique, une nuance.
- **Au moins un outil de décision par article** : exemple annoté, liste à cocher, modèle de message, tableau comparatif ou procédure.
- Un exemple est annoncé comme un exemple. Les marques et produits cités en exemple sont fictifs.
- Aucune expérience personnelle, aucun témoignage, aucun chiffre de marché, de tarif ou de volume de recherche inventé. Pour une règle qui change — droit, obligations — une source primaire datée, et ses limites.
- Interdits : « dans un monde en constante évolution », « révolutionnez », « libérez votre potentiel », « solution incontournable », et toute phrase qui resterait vraie en remplaçant AVYOR par un autre nom.

Ces règles ne sont pas seulement des intentions : `tests/unit/news-articles.test.mjs` les vérifie sur les articles livrés (réponse en gras dès l’introduction, outil de décision présent, absence de formules creuses, absence de chiffres non sourcés, faits produit conformes à l’application, source officielle dès qu’une règle est citée).

## Appel à l’action

Une action principale par article, vers une page qui existe : `/creators/`, `/brands/`, `/how-it-works/`, `/features/`, `/security/`, `/download/`. Placée en fin de lecture. **Le lecteur doit pouvoir profiter de l’article sans s’inscrire.** Pas de compteur fictif, pas de popup, pas de bouton vers un parcours inexistant.

## Mesure

Trois événements, sans donnée personnelle : consultation d’article, utilisation du sommaire, clic sur l’appel à l’action — avec l’identifiant de l’article et son public éditorial. Les recherches libres ne sont pas transmises. Ces événements passent par `track()`, qui émet un événement DOM et **n’envoie rien à un tiers pour l’instant** : le branchement à un outil de mesure reste à faire, avec la question du consentement à trancher à ce moment-là.

---

# Les dix sujets évalués

Angles de départ, validés contre le contenu du site et le fonctionnement réel de l’application. Ce ne sont pas des mots-clés dont le volume aurait été mesuré. Les quatre P1 sont **rédigés et livrés en brouillon**.

## P1 — Brief UGC : quoi préciser pour éviter les allers-retours · rédigé

- **Public** : marques · **Thématique** : préparer une collaboration
- **Problème** : une vidéo soignée qui ne sert pas la campagne, et une semaine perdue en corrections.
- **Intention de recherche** : savoir quoi écrire dans un brief.
- **Question principale** : que doit contenir un brief pour éviter les allers-retours ?
- **Angle distinctif** : cinq décisions à prendre *avant* d’écrire, puis un brief annoté comparant consigne floue et consigne utile.
- **Slug** : `brief-ugc-quoi-preciser` · **Titre SEO** : Brief UGC : les points à préciser avant le tournage | AVYOR
- **Extrait** : Une vidéo soignée qui passe à côté du sujet vient souvent d’un brief flou. Les cinq décisions à prendre avant le tournage, un exemple annoté et une liste à vérifier.
- **Plan** : Pourquoi un brief flou coûte des allers-retours · Les cinq décisions (H3 : public · message · livrables · imposé/libre · validation et droits) · Exemple de brief annoté · Ce qu’il vaut mieux ne pas écrire · La liste à vérifier · Dans AVYOR
- **Outil** : tableau « rubrique / brief flou / brief utile / ce que ça évite » + liste à cocher.
- **Sources** : loi n° 2023-451, article 5 (mention « Publicité » / « Collaboration commerciale »).
- **Liens internes** : `/brands/`, article « choisir un Creator ». **CTA** : Découvrir le parcours marque → `/brands/`.
- **Illustration** : icône 3D « contexte » (fiche à cocher et bulle de message) sur le fond de marque.

## P1 — Comment choisir un Creator au-delà du nombre d’abonnés · rédigé

- **Public** : marques · **Thématique** : choisir un partenaire
- **Problème** : trois propositions soignées, et aucun critère pour trancher.
- **Question principale** : sur quoi comparer des Creators quand les vidéos se valent ?
- **Angle distinctif** : partir de l’objectif de campagne (contenus pour vos canaux ou diffusion à une audience), qui change le poids de chaque critère — et celui des abonnés.
- **Slug** : `choisir-un-creator-au-dela-des-abonnes` · **Titre SEO** : Choisir un Creator au-delà du nombre d’abonnés | AVYOR
- **Plan** : D’abord, votre objectif · Ce que le nombre d’abonnés dit et ne dit pas · Cinq critères (H3) · La grille de comparaison · Les signaux d’alerte · Dans AVYOR
- **Outil** : grille notée de 1 à 3, avec la priorité de chaque critère selon l’objectif ; exemple illustratif de trois profils.
- **Liens internes** : `/brands/`, article « brief UGC ». **CTA** : Découvrir le parcours marque → `/brands/`.
- **Illustration** : icône 3D « découvrir » (boussole).

## P1 — Portfolio UGC : quoi montrer quand on débute · rédigé

- **Public** : Creators · **Thématique** : créer du contenu
- **Problème** : candidater sans aucun travail client à montrer.
- **Angle distinctif** : un portfolio montre *comment vous travaillez*, pas pour qui ; des projets personnels présentés honnêtement suffisent.
- **Slug** : `portfolio-ugc-quoi-montrer-quand-on-debute`
- **Plan** : Ce qu’une marque cherche · Des projets personnels présentés comme tels · Cinq pièces (tableau) · Trois lignes de contexte sous chaque vidéo · Ce qu’il vaut mieux retirer · Avant de candidater · Dans AVYOR
- **Outil** : tableau « pièce / durée indicative / ce qu’elle prouve », exemple de légende honnête, liste à cocher.
- **Liens internes** : `/creators/`, article « première collaboration ». **CTA** : Découvrir le parcours Creator → `/creators/`.
- **Illustration** : icône 3D « créer » (clap de tournage).

## P1 — Première collaboration avec une marque : les points à clarifier · rédigé

- **Public** : Creators · **Thématique** : préparer une collaboration
- **Problème** : dire oui trop vite, et découvrir les conditions après.
- **Angle distinctif** : cinq points à obtenir **par écrit**, plus un message prêt à envoyer ; et ce que la loi française impose quand on publie sur son propre compte.
- **Slug** : `premiere-collaboration-marque-points-a-clarifier`
- **Plan** : Les livrables · Le calendrier et les retouches · La rémunération : montant, forme, moment · Les droits d’usage · La transparence si vous publiez · Un message pour clarifier · Avant d’accepter · Dans AVYOR
- **Outil** : modèle de message + liste à cocher.
- **Sources** : loi n° 2023-451 articles 5 et 8 ; décret n° 2025-1137 du 28 novembre 2025 (seuil de 1 000 € HT, en vigueur au 1er janvier 2026). Réserve explicite : texte modifié depuis, droit français, pas un conseil juridique.
- **Liens internes** : `/how-it-works/`, article « portfolio ». **CTA** : Voir le parcours étape par étape → `/how-it-works/`.
- **Illustration** : icône 3D « collaborer » (deux bulles de conversation).

## P2 — UGC ou influence : que choisir pour votre campagne ?

- **Public** : marques · **Thématique** : choisir un partenaire · **Intention** : comprendre une différence avant d’arbitrer un budget.
- **Angle** : deux usages complémentaires, pas deux camps ; ce que chacun produit, ce qu’il coûte en préparation, ce qu’il permet de mesurer.
- **Slug proposé** : `ugc-ou-influence-que-choisir` · **Plan** : Ce que recouvre chaque mot · Ce que vous obtenez · Ce que vous pouvez mesurer · Quand les combiner · Tableau de décision · Dans AVYOR.
- **Outil** : tableau « objectif → format → livrable → ce que vous pouvez en conclure ».
- **Sources** : obligations de transparence pour l’influence (loi n° 2023-451). **CTA** : `/brands/`.

## P2 — Présenter ses idées à une marque sans envoyer un message générique

- **Public** : Creators · **Thématique** : préparer une collaboration.
- **Angle** : une prise de contact utile propose une idée précise pour *ce* produit, pas un curriculum.
- **Slug proposé** : `contacter-une-marque-sans-message-generique` · **Plan** : Pourquoi les messages génériques échouent · Ce qu’une marque veut lire · Trois structures de message · Adapter sans recopier · Les erreurs qui coûtent la réponse.
- **Outil** : trois modèles de message annotés, à personnaliser. **CTA** : `/creators/`.

## P2 — Donner un retour sur une vidéo sans perdre l’intention du créateur

- **Public** : les deux · **Thématique** : créer du contenu.
- **Angle** : un retour utile porte sur l’effet obtenu, pas sur le goût ; méthode en trois temps et exemple avant/après d’un même commentaire.
- **Slug proposé** : `donner-un-retour-sur-une-video` · **Outil** : réécriture commentée de retours réels-types (fictifs), liste des formulations à éviter. **CTA** : `/how-it-works/`.

## P2 — Une campagne génère des vues : comment savoir si elle aide votre marque ?

- **Public** : marques · **Thématique** : suivre les résultats.
- **Angle** : choisir la mesure selon l’objectif, et dire franchement les limites de l’attribution.
- **Slug proposé** : `mesurer-une-campagne-au-dela-des-vues` · **Outil** : tableau « objectif → indicateur → ce qu’il ne dit pas ».
- **Précaution** : aucun seuil chiffré présenté comme une norme ; toute donnée citée vient d’une source primaire datée. **CTA** : `/security/` ou `/features/` selon le contenu vérifié.

## P3 — Préparer un tournage produit avec un smartphone

- **Public** : Creators · **Thématique** : créer du contenu.
- **Angle** : une liste de préparation qui tient sur une page — lumière, son, cadrage, plans à ne pas oublier.
- **Slug proposé** : `preparer-un-tournage-avec-un-smartphone` · **Outil** : liste à cocher imprimable + liste de plans type. **CTA** : `/creators/`.

## Conditionnel — Ce qui change sur AVYOR : [fonctionnalité vérifiée]

- **Public** : selon la fonctionnalité · **Type** : nouveauté AVYOR.
- **Condition de publication** : la fonctionnalité est livrée dans l’application et vérifiée. Bénéfice concret, disponibilité réelle, étapes d’utilisation. **Tant qu’aucune évolution n’est vérifiée, cet article n’existe pas.**

## Ce qui reste hors périmètre pour l’instant

Études de cas et témoignages : aucun cas client réel n’est disponible. Comparatifs de plateformes concurrentes : impossible sans données vérifiables. Articles « variantes » visant le même besoin avec d’autres mots : ils se cannibaliseraient sans rien apporter au lecteur.

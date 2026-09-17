# Moteur SEO — méthode réutilisable

Ce document décrit la méthode appliquée à shavod.com, et comment la reprendre
sur un autre site. Il est écrit pour être lu par une personne ou par un agent.

Le principe tient en une phrase : **chaque règle est un test qui échoue avant
d'être vraie.** Un audit se périme le jour où il est rendu ; un test tient.

129 contrôles répartis en six fichiers. Aucun n'a été écrit après coup pour
valider ce qui existait : tous ont d'abord échoué.

---

## Ce que la méthode a trouvé sur un vrai site

Ces défauts avaient tous survécu à plusieurs relectures humaines. C'est ce qui
justifie la méthode : ils ne se voient pas à l'œil.

| Défaut                             | Comment il se manifestait                                                                                         | Ce qui l'a révélé                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Les URL bilingues n'existaient pas | Chaque `/en/x` redirigeait vers le français ; canoniques, `hreflang` et sitemap désignaient tous des redirections | Les en-têtes HTTP de production                  |
| Le H1 lu par Google                | « Votre idéeoffre mérite mieux qu'un siteun outilun logo »                                                        | Extraction du texte du HTML **construit**        |
| Sept titres à mot doublé           | « claireclaire », « lancementlancement », « usedused »                                                            | Motif `\b(\w{5,})\1\b` sur les titres construits |
| Coordonnées géographiques          | Le point déclaré tombait à 59 km de l'adresse et 78 km de la ville annoncée                                       | Distance orthodromique calculée                  |
| Compteur de projets                | « 22+ » sous un commentaire affirmant qu'il était dérivé — le catalogue en contenait 15                           | Comparaison constante ↔ source                   |
| 46 clés de traduction              | Deux cartes affichaient `services.branding.title` en français                                                     | Parité des dictionnaires, arbre complet          |
| Six clés affichées brutes          | `getTranslation("x") \|\| "repli"` — le repli ne s'est **jamais** déclenché                                       | Balayage du HTML construit                       |
| Le menu embarquait tout            | 338 ko de contenu éditorial sur chaque page, pour en afficher 4                                                   | Poids des scripts du premier chargement          |
| Onze pages sans demande            | Et aucune page sur les deux villes qui en avaient                                                                 | Croisement Search Console ↔ routes               |

---

## Le principe : la vérité est dans le HTML construit

C'est la leçon centrale. Le code dit ce qu'on a voulu ; le HTML construit dit ce
que le robot reçoit. **Six des neuf défauts ci-dessus étaient invisibles dans le
code.**

```ts
/** Le texte visible d'une page construite. */
function visibleText(page: string): string {
  return readFileSync(`.next/server/app/${page}.html`, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "") // charges utiles du framework
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ");
}
```

Trois pièges à connaître :

1. **Retirer les `<script>` avant d'analyser.** Les charges utiles d'un
   framework moderne ressemblent à s'y méprendre à des clés de traduction.
2. **Refuser de passer à vide.** Un contrôle qui ne trouve aucune page donne une
   fausse assurance : `expect(pages.length).toBeGreaterThan(20)`.
3. **Retirer les citations.** Un avis client porte les mots du client — voir
   plus bas.

---

## Les huit familles de règles

### 1. Aucune affirmation sans source

Un pourcentage, un délai, une note ou un prix ne vient que d'une source du
dépôt. Trois couches portent ces affirmations, et **les tests de contenu n'en
regardent souvent qu'une** :

- le contenu visible ;
- le `<head>` — titres, descriptions ;
- le JSON-LD.

Sur shavod.com, les chiffres retirés du contenu avaient survécu dans les deux
autres pendant des mois.

```ts
test("aucune affirmation invérifiable", () => {
  const guilty = routeFiles().filter((file) =>
    /\+?\d+\s*%|sous 24\s?h|résultats? garanti/i.test(read(file)),
  );
  expect(guilty).toEqual([]);
});
```

**Les compteurs se dérivent, ou s'attestent.** Deux cas, et il faut les
distinguer :

```ts
/** Ce que le catalogue publie : dérivé, il ne peut pas dater. */
export const PUBLISHED_PROJECT_COUNT = buildCatalog().length;

/** Ce que le studio a livré, publiable ou non.
 *  **Attesté par [nom] le [date].** Ce compte ne se déduit d'aucun fichier. */
export const PROJECT_COUNT = 24;
```

Le mensonge n'était pas le chiffre : c'était un chiffre **saisi qui se faisait
passer pour dérivé**, sous un commentaire affirmant le contraire.

### 2. Les données structurées décrivent le visible

C'est la règle qui tranche tous les cas limites.

- Un `FAQPage` sans FAQ affichée → à supprimer. Douze pages en portaient un.
- Un prix balisé sur une page qui n'en publie pas → à supprimer.
- Un prix balisé sur une page qui les affiche → **légitime**.
- Un fil d'Ariane d'un seul maillon → ne décrit rien.

```ts
test("un prix n'est balisé que là où la page le publie", () => {
  const guilty = sources
    .filter((file) => !file.includes("/pricing/")) // cette page les affiche
    .filter((file) => /minPrice|priceSpecification/.test(read(file)));
  expect(guilty).toEqual([]);
});
```

### 3. Une zone desservie n'est pas un établissement

La distinction qui permet de couvrir un territoire honnêtement.

- `areaServed` dit **où l'on intervient** — élargissable au rayon réel ;
- `address` prétendrait **y tenir un bureau** — à ne poser qu'après validation.

Elle vaut aussi pour la rédaction : « Agence web **à** Fréjus » (présence
réelle) contre « Agence web **pour** Nice » (territoire desservi). « à Nice »
laisserait croire à un bureau.

**Le territoire se couvre par le texte, pas par des pages.** Publier une page
par commune produit des gabarits identiques — ce que Google range dans l'abus de
contenu produit à grande échelle. Les communes sont nommées en texte sur la page
de leur territoire : la couverture sémantique existe sans page mince, et elles
restent du texte — un lien supposerait une page.

### 4. Les avis ne se réécrivent jamais

Deux formules proscrites figuraient dans de vrais avis Google. **Les corriger
serait falsifier un témoignage.** Le contrôle écarte les cartes d'avis avant
d'analyser, et le dit.

```ts
function withoutReviewCards(html: string): string {
  // Découpé sur le **conteneur**, jamais sur des bornes textuelles : la
  // section est montée sur plusieurs pages, et les bornes tombent au milieu.
  return html.replace(/<article class="reviews-card"[\s\S]*?<\/article>/g, " ");
}
```

### 5. Une clé de traduction n'atteint jamais l'écran

Trois contrôles distincts, parce qu'ils ne voient pas la même chose :

| Contrôle                 | Ce qu'il voit             | Ce qu'il rate                |
| ------------------------ | ------------------------- | ---------------------------- |
| Parité des dictionnaires | Une clé absente d'un côté | Une clé absente **des deux** |
| Valeurs vides            | `"clé": ""`               | L'absence d'entrée           |
| **HTML construit**       | Tout                      | Rien                         |

Le troisième a trouvé six clés affichées telles quelles. Trois portaient un
repli :

```tsx
{
  getTranslation("contact.stat.projects") || "Projets livrés";
}
```

**Ce repli ne s'est jamais déclenché.** La fonction renvoie la clé quand elle ne
trouve rien, et une chaîne non vide est _truthy_. Le filet avait l'air posé.

Et la parité doit parcourir **l'arbre entier** : `Object.keys()` ne voit que le
premier niveau, alors que les dictionnaires mêlent souvent clés plates et objets.

### 6. Le texte s'adresse au client

Une liste de formules creuses, refusée dans les dictionnaires **et** dans le
HTML construit. Elles ont un point commun : elles se posent sur n'importe quelle
entreprise du secteur.

> solution digitale · expertise 360° · clé en main · partenaire de confiance ·
> accompagnement personnalisé · besoins spécifiques · donner vie à vos idées ·
> technologie de pointe · résultats garantis · possibilités illimitées

Trois règles qui comptent autant :

- **Une seule voix.** Un site qui mêle « nous construisons » et « je me
  spécialise » laisse le visiteur se demander s'il parle à une équipe ou à une
  personne. La question devient une objection.
- **Une réponse commence par la réponse.** « Garantissez-vous les résultats ? »
  → « Non, et personne ne le peut honnêtement », suivi de ce qui est tenu.
  Répondre franchement inspire plus confiance que contourner.
- **Les titres capitalisent comme la langue le veut.** « Développement Web » est
  une convention anglaise ; en français, seuls le premier mot, les noms propres
  et les sigles prennent la majuscule.

### 7. Un lien interne désigne l'URL finale

Ni une redirection, ni un doublon, ni une page qui déclare ne pas être
l'originale.

Et **le maillage ne peut pas être à sens unique** : si les pages commerciales
renvoient aux preuves, les preuves doivent ramener aux offres. Sinon le
portfolio reçoit l'autorité sans jamais la rendre, et le visiteur convaincu par
un projet n'a aucun chemin vers l'offre qui l'a produit.

### 8. Ce que le robot reçoit doit peser ce qu'il affiche

Le menu appelait le contenu des onze pages de service. Rendu partout : **338 ko
de texte éditorial sur chaque page, pour en afficher 4.**

La correction ne doit pas rouvrir la porte à la divergence — un libellé écrit à
la main finit par contredire la page qu'il annonce. Un index **dérivé**,
regénéré par script et recomparé à la source par test, garde les deux
propriétés.

---

## L'ordre d'exécution

Cet ordre est celui de l'impact, mesuré. Les trois premiers points annulent tout
le reste s'ils sont faux.

1. **La stratégie d'URL.** Comment les langues sont servies. Sur shavod.com, une
   ligne de configuration rendait inaccessible toute l'architecture bilingue que
   le site déclarait par ailleurs. À vérifier **par les en-têtes HTTP de
   production**, jamais par lecture du code.
2. **Canoniques, `hreflang`, sitemap.** Ils doivent désigner des URL qui
   répondent 200. Une canonique vers une redirection s'annule ; un `hreflang`
   vers une redirection fait écarter le groupe entier.
3. **Les affirmations.** Retirer ce qui n'est pas opposable, avant d'écrire quoi
   que ce soit de neuf.
4. **Search Console.** C'est ici que l'ordre s'inverse : arrêter de deviner.
5. **Le contenu**, guidé par les données.
6. **Le maillage.**
7. **La mesure** — sans elle, on ne saura pas si tout cela a servi.
8. **La performance.**

### Search Console change tout

Sur shavod.com, l'export a **contredit** mon diagnostic. Je proposais de
supprimer des pages locales ; les données montraient qu'il en manquait deux, et
que onze ciblaient des villes sans demande.

Trois croisements, dans cet ordre :

```
requêtes à impressions ≠ 0   ↔   pages existantes
```

→ une requête à 87 impressions sans page dédiée est une page à écrire.

```
pages existantes   ↔   impressions
```

→ une page à zéro impression depuis trois mois ne mérite pas d'être enrichie.

```
position moyenne   ↔   clics
```

→ position 13 à 21 = page 2 = zéro clic. Le problème n'est pas d'exister, c'est
d'être en page 1.

Un signal souvent négligé : **« Détectée, actuellement non indexée »**. Google a
trouvé la page et a **choisi** de ne pas l'indexer. Sur shavod.com : 42 pages sur 70. C'est le symptôme d'un contenu jugé mince ou dupliqué.

---

## Mesurer la performance : trois pièges

Chacun m'a fait perdre du temps, et le premier m'a fait annoncer un faux
diagnostic.

**1. Identifier un morceau avant de l'accuser.** J'ai attribué 341 ko à une
bibliothèque 3D en cherchant « three » en minuscules — le motif matchait autre
chose. C'était du contenu éditorial. Empreinte fiable : les chaînes littérales
les plus fréquentes du fichier.

**2. Vérifier qu'un défaut est réel avant de le corriger.** Six images sans
`width`/`height` : aucun décalage, leurs conteneurs réservaient la boîte par
`aspect-ratio`. Mesurer avant, corriger ensuite.

**3. `filter` n'est pas une propriété de composition.** Contrairement à
`transform` et `opacity`, elle force un redessin. Une animation qui écrit
`filter` à chaque image coûte un repaint par image — sur du texte, sur un GPU de
téléphone, ça se sent.

Deux gaspillages typiques d'une boucle d'animation :

- **Une valeur hors de ce que l'œil distingue.** Un flou plafonné à 100 px sur
  un texte de 34 px : il est déjà dissous vers 20-24 px, et le coût d'un flou
  gaussien croît avec le rayon.
- **Écrire ce qui ne change pas.** La boucle écrivait sur cinq nœuds quand deux
  changeaient. **Le navigateur ne compare pas avant d'invalider** : il faut
  comparer soi-même.

---

## Ce qu'un test doit vérifier

**La propriété, jamais le mécanisme.** Trois tests rencontrés sur ce projet
encodaient un contournement plutôt que ce qui comptait :

| Le test disait                           | Ce qu'il fallait dire                                          |
| ---------------------------------------- | -------------------------------------------------------------- |
| « `serviceCopy` doit être importé ici »  | « le libellé du menu doit égaler celui de la page »            |
| « le badge rend exactement deux copies » | « le badge est annoncé une seule fois »                        |
| « aucun `onClick` sur ce lien »          | « pas de `window.open`, `preventDefault` ni poussée de route » |

Le premier interdisait l'optimisation qui a retiré 242 ko. Le deuxième
**exigeait le bug**. Le troisième interdisait de mesurer un départ.

Quand un test bloque une amélioration correcte, la question à se poser est :
_vérifie-t-il la propriété, ou la façon dont elle était obtenue ?_

**Un test doit ignorer les commentaires.** Celui qui explique une correction
cite ce qu'elle a retiré, et suffit à faire échouer le contrôle. Ce piège s'est
présenté quatre fois.

```ts
const read = (file: string) =>
  readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1"); // `[^:]` épargne les `https://`
```

---

## Comment reprendre sur un autre site

1. **Construire, puis extraire.** Titres, descriptions, H1, canoniques,
   `hreflang`, JSON-LD de chaque page du HTML construit. C'est l'inventaire, et
   il est mécanique.
2. **Vérifier la production par les en-têtes**, jamais par lecture du code. Les
   redirections, les cookies de langue et les couches d'hébergement ne se voient
   que là.
3. **Écrire les contrôles rouges d'abord**, famille par famille, dans l'ordre
   ci-dessus.
4. **Exporter Search Console** avant d'écrire une ligne de contenu.
5. **Corriger, en mesurant après chaque lot.**

### Ce que la méthode ne fait pas

Elle ne remplace ni la recherche concurrentielle, ni la connaissance du métier
du client, ni les preuves — un projet mené sur place, un témoignage. Elle
garantit que **ce que le site dit est vrai et lisible par un moteur**. Elle ne
garantit pas que ce soit intéressant.

Sur shavod.com, il reste : la recherche concurrentielle, sept études de cas à
écrire, et une décision de langue pour l'Italie.

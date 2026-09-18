/*
 * Les quatre premiers articles News (priorité P1), en brouillon.
 *
 * Règles suivies : vouvoiement, un public principal par article, la réponse
 * centrale dès l'introduction, au moins un outil de décision (exemple annoté,
 * grille, liste à vérifier), aucun chiffre inventé, aucune expérience ou
 * témoignage fabriqué. Les exemples sont signalés comme des exemples. Les
 * règles juridiques citées renvoient à leur source officielle, datée.
 *
 * Toute mention d'une fonctionnalité AVYOR a été vérifiée dans l'application
 * (voir docs/audits/avyor-content-audit.md et le contenu du site).
 */

/* ------------------------------------------------------------------ DSL */

const t = (text, ...marks) => ({ type: 'text', text, ...(marks.length ? { marks } : {}) });
const b = (text) => t(text, { type: 'bold' });
const i = (text) => t(text, { type: 'italic' });
const a = (text, href) => t(text, { type: 'link', attrs: { href } });
const inline = (parts) => parts.map((part) => (typeof part === 'string' ? t(part) : part));
const p = (...parts) => ({ type: 'paragraph', content: inline(parts) });
const heading = (level) => (text) => ({ type: 'heading', attrs: { level }, content: [t(text)] });
const h2 = heading(2);
const h3 = heading(3);
const item = (entry) => ({
  type: 'listItem',
  content: [Array.isArray(entry) ? p(...entry) : p(entry)],
});
const ul = (...items) => ({ type: 'bulletList', content: items.map(item) });
const ol = (...items) => ({ type: 'orderedList', content: items.map(item) });
const callout = (variant, ...content) => ({ type: 'callout', attrs: { variant }, content });
const cell = (type) => (value) => ({
  type,
  content: [Array.isArray(value) ? p(...value) : p(value)],
});
const table = (head, ...rows) => ({
  type: 'table',
  content: [
    { type: 'tableRow', content: head.map(cell('tableHeader')) },
    ...rows.map((row) => ({ type: 'tableRow', content: row.map(cell('tableCell')) })),
  ],
});
const doc = (...content) => ({ type: 'doc', content });

const TEAM = { kind: 'organization', name: 'Équipe éditoriale AVYOR' };
const ACCESSED = '2026-09-18';
const LOI = {
  title: 'Loi n° 2023-451 du 9 juin 2023 visant à encadrer l’influence commerciale — article 5',
  url: 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000047663211',
  publisher: 'Légifrance',
  accessed: ACCESSED,
};

/* ================================================================ Article 1 */

const brief = {
  id: 'briefugc0001',
  slug: 'brief-ugc-quoi-preciser',
  icon: 'context',
  coverAlt:
    'Illustration AVYOR : une fiche de points à cocher et une bulle de message, en volume, sur fond bleu nuit.',
  article: {
    title: 'Brief UGC : quoi préciser pour éviter les allers-retours',
    excerpt:
      'Une vidéo soignée qui passe à côté du sujet vient souvent d’un brief flou. Les cinq décisions à prendre avant le tournage, un exemple annoté et une liste à vérifier.',
    type: 'guide',
    audience: 'brands',
    theme: 'prepare',
    author: TEAM,
    featured: true,
    cta: { label: 'Découvrir le parcours marque', slug: 'brands' },
    related: ['choixcrea001'],
    translations: {},
    sources: [LOI],
    seo: {
      title: 'Brief UGC : les points à préciser avant le tournage | AVYOR',
      description:
        'Public, message, livrables, contraintes, validation et droits d’usage : ce qu’un brief UGC doit fixer pour éviter les allers-retours, avec un exemple annoté.',
    },
    body: doc(
      p(
        'La vidéo arrive. La lumière est belle, le produit bien filmé, le ton naturel. Et pourtant, elle ne sert pas votre campagne : elle parle de la mauvaise qualité du produit, elle dure une minute quand il en fallait quinze secondes, ou elle est tournée à l’horizontale. Vous demandez une nouvelle version, le Creator ne comprend pas ce qui n’allait pas, et une semaine passe.',
      ),
      p(
        'Souvent, le problème n’est pas la vidéo mais le brief. ',
        b(
          'Un brief évite les allers-retours quand il fixe cinq choses avant le tournage : à qui parle la vidéo, le message unique, les livrables exacts, ce qui est imposé ou libre, et la façon dont la vidéo sera validée et utilisée.',
        ),
        ' Le reste de cet article détaille chacune de ces décisions, avec un exemple de brief annoté et une liste à vérifier avant l’envoi.',
      ),
      callout(
        'example',
        p(
          b('UGC'),
          ' (',
          i('user-generated content'),
          ') désigne ici un contenu créé par un Creator pour une marque, qui le publie en général sur ses propres canaux : publicité, fiche produit, réseaux de la marque. C’est différent d’une publication d’influence, diffusée par le Creator auprès de sa propre audience. Les deux se préparent avec un brief, mais pas avec les mêmes attentes.',
        ),
      ),
      h2('Pourquoi un brief flou coûte des allers-retours'),
      p(
        'Un Creator qui reçoit un brief incomplet ne s’arrête pas : il comble les vides avec ses propres hypothèses. Il choisit un angle, une durée, un format, un ton. Ces choix sont souvent bons en soi, mais ce ne sont pas les vôtres. Vous découvrez l’écart à la livraison, au moment où le corriger coûte le plus cher : un nouveau tournage plutôt qu’une phrase de plus dans le brief.',
      ),
      p(
        'Les consignes les plus courantes sont aussi les plus trompeuses. ',
        i('« Une vidéo authentique qui met en avant le produit »'),
        ' ne dit ni pour qui, ni quel avantage, ni sous quelle forme. Chacun peut s’y reconnaître, et c’est précisément ce qui la rend inutile.',
      ),
      h2('Les cinq décisions à prendre avant d’écrire'),
      h3('1. À qui parle la vidéo, et de quel problème'),
      p(
        'Décrivez une personne précise et la situation dans laquelle votre produit l’aide. ',
        i('« Les femmes de 25 à 35 ans »'),
        ' est une cible marketing ; ',
        i('« quelqu’un qui court le matin et dont la gourde fuit dans le sac »'),
        ' est une scène que le Creator peut jouer. Plus la situation est concrète, plus la vidéo sera juste sans que vous ayez à l’écrire à sa place.',
      ),
      h3('2. Le message unique'),
      p(
        'Une vidéo courte porte ',
        b('un seul message'),
        '. Si vous listez six avantages, le Creator en choisira un, ou les citera tous trop vite pour qu’un seul reste. Choisissez celui qui compte pour la personne décrite plus haut, et gardez les autres pour d’autres vidéos.',
      ),
      h3('3. Les livrables, au format près'),
      p('C’est une partie souvent oubliée, et pourtant la plus simple à écrire. Précisez :'),
      ul(
        'le nombre de vidéos, et leur durée cible ;',
        'le format : vertical 9:16, carré, horizontal ;',
        'ce que vous attendez exactement : vidéo montée, fichiers bruts, ou les deux ;',
        'les variantes utiles : plusieurs accroches pour les trois premières secondes, plusieurs fins ;',
        'les sous-titres, la musique, le texte à l’écran : qui s’en charge.',
      ),
      h3('4. Ce qui est imposé, ce qui est libre'),
      p(
        'Séparez en deux listes. D’un côté, ',
        b('les points non négociables'),
        ' : une mention à faire figurer, une allégation interdite, un geste d’utilisation à montrer, une marque concurrente à ne pas filmer. De l’autre, ce que vous laissez au Creator : le décor, les mots, le rythme. Imposer un script mot à mot retire souvent ce pour quoi vous l’avez choisi ; ne dictez que les phrases qui doivent l’être.',
      ),
      h3('5. La validation et les droits d’usage'),
      p(
        'Dites qui valide, dans quel délai, et combien de tours de retouches sont compris. Précisez aussi ',
        b('où, combien de temps et dans quels pays'),
        ' vous utiliserez la vidéo : sur vos réseaux, en publicité payante, sur votre site. Ces droits d’usage font partie de l’accord ; les laisser implicites, c’est reporter la discussion au moment où elle est la plus délicate.',
      ),
      p(
        'Si le Creator publie aussi la vidéo sur son propre compte, la collaboration relève de l’influence commerciale. En France, la loi impose alors d’indiquer clairement la mention « Publicité » ou « Collaboration commerciale » pendant toute la promotion (',
        a('loi n° 2023-451, article 5', LOI.url),
        '). Autant le prévoir dans le brief.',
      ),
      h2('Exemple de brief annoté'),
      callout(
        'example',
        p(
          'Produit et marque fictifs, pour l’illustration. Chaque ligne montre une consigne floue, sa version utile et ce qu’elle change.',
        ),
      ),
      table(
        ['Rubrique', 'Brief flou', 'Brief utile', 'Ce que ça évite'],
        [
          'Public',
          '« Les sportifs »',
          '« Quelqu’un qui court avant le travail et range sa gourde dans son sac. »',
          'Un angle « performance » quand le vrai sujet est le sac mouillé.',
        ],
        [
          'Message',
          '« Montrer toutes les qualités de la gourde »',
          '« Elle ne fuit pas, même renversée dans un sac. »',
          'Six avantages cités en quinze secondes, aucun retenu.',
        ],
        [
          'Livrables',
          '« Une vidéo dynamique »',
          '« Deux vidéos verticales 9:16 de 15 à 20 s, trois accroches différentes, fichiers bruts inclus. »',
          'Une vidéo horizontale d’une minute, impossible à utiliser en publicité.',
        ],
        [
          'Imposé / libre',
          'Rien de précisé',
          '« Montrer la gourde retournée au-dessus d’un sac ouvert. Libre : lieu, tenue, mots. Interdit : parler de garde au froid. »',
          'Une allégation que la marque ne peut pas prouver.',
        ],
        [
          'Validation et usage',
          'Rien de précisé',
          '« Retour sous 48 h, une série de retouches comprise. Usage : réseaux de la marque et publicité, 6 mois, France. »',
          'Une négociation sur les droits après la livraison.',
        ],
      ),
      h2('Ce qu’il vaut mieux ne pas écrire'),
      ul(
        [
          b('Des adjectifs à la place de décisions'),
          ' : « authentique », « dynamique », « impactant » ne se filment pas.',
        ],
        [b('Une liste d’avantages sans hiérarchie'), ' : si tout est prioritaire, rien ne l’est.'],
        [b('Un script complet imposé'), ' quand seules deux phrases sont réellement obligatoires.'],
        [
          b('Des références que le Creator ne peut pas voir'),
          ' : « comme notre dernière campagne » sans lien vers celle-ci.',
        ],
      ),
      h2('La liste à vérifier avant d’envoyer'),
      callout(
        'checklist',
        ul(
          'La personne visée et sa situation sont décrites en une ou deux phrases.',
          'Un seul message principal est écrit noir sur blanc.',
          'Le nombre de vidéos, leur durée, leur format et les variantes sont précisés.',
          'Les points imposés et interdits sont séparés de ce qui est libre.',
          'Le délai de validation et le nombre de retouches comprises sont indiqués.',
          'Les droits d’usage — supports, durée, pays — sont écrits.',
          'La mention de transparence est prévue si le Creator publie sur son compte.',
        ),
      ),
      h2('Dans AVYOR'),
      p(
        'L’assistant de campagne d’AVYOR procède en quatre étapes : informations, budget, ciblage, puis révision du brief complet avant publication. Le ciblage couvre les plateformes, l’audience et l’échéance ; la révision est le bon moment pour repasser la liste ci-dessus. Les droits d’usage accordés sur un livrable sont ceux définis dans les conditions de la campagne acceptée : ce que vous y écrivez fait référence pour les deux parties.',
      ),
    ),
  },
};

/* ================================================================ Article 2 */

const choose = {
  id: 'choixcrea001',
  slug: 'choisir-un-creator-au-dela-des-abonnes',
  icon: 'discover',
  coverAlt: 'Illustration AVYOR : une boussole en volume, violette et bleue, sur fond bleu nuit.',
  article: {
    title: 'Comment choisir un Creator au-delà du nombre d’abonnés',
    excerpt:
      'Trois propositions, trois vidéos soignées : laquelle convient à votre marque ? Une grille de comparaison reliée à l’objectif de votre campagne, et les signaux qui doivent vous alerter.',
    type: 'guide',
    audience: 'brands',
    theme: 'choose',
    author: TEAM,
    featured: false,
    cta: { label: 'Découvrir le parcours marque', slug: 'brands' },
    related: ['briefugc0001'],
    translations: {},
    sources: [],
    seo: {
      title: 'Choisir un Creator au-delà du nombre d’abonnés | AVYOR',
      description:
        'Comment comparer des Creators selon l’objectif de votre campagne : façon d’expliquer un produit, adéquation au public, livrables, fiabilité. Grille à reprendre.',
    },
    body: doc(
      p(
        'Vous avez reçu trois propositions de Creators. Les vidéos sont soignées, mais vous ne savez toujours pas laquelle convient à votre marque. ',
        b(
          'Commencez par comparer leur manière d’expliquer un produit, les livrables qu’ils proposent et les conditions de collaboration.',
        ),
        ' Le nombre d’abonnés ne répond pas, à lui seul, à ces questions — et selon votre objectif, il peut ne pas compter du tout.',
      ),
      p(
        'Cet article vous donne une méthode : partir de l’objectif de la campagne, comparer cinq critères observables, puis trancher avec une grille que vous pouvez reprendre telle quelle.',
      ),
      h2('D’abord, votre objectif'),
      p(
        'La première question n’est pas « quel Creator choisir ? » mais « de quoi ai-je besoin ? ».',
      ),
      ul(
        [
          b('Des contenus pour vos propres canaux'),
          ' (publicité, fiche produit, réseaux de la marque) : c’est une commande UGC. Ce qui compte, c’est la qualité et la justesse de la vidéo. L’audience du Creator ne sera pas utilisée.',
        ],
        [
          b('Être vu par une audience précise'),
          ' : c’est de l’influence. L’audience du Creator devient un critère, mais sa composition compte davantage que sa taille.',
        ],
      ),
      p(
        'Beaucoup de campagnes mélangent les deux. Écrivez simplement lequel pèse le plus : il décidera en cas d’hésitation.',
      ),
      h2('Ce que le nombre d’abonnés dit, et ce qu’il ne dit pas'),
      p(
        'Un nombre d’abonnés indique une taille d’audience potentielle, à un moment donné. Il ne dit ni qui compose cette audience, ni si elle ressemble à vos clients, ni si le Creator sait présenter un produit qu’il n’a pas choisi. Pour une commande UGC, il ne dit presque rien d’utile : vous achetez une vidéo, pas une diffusion.',
      ),
      h2('Cinq critères à comparer'),
      h3('Sa façon d’expliquer un produit'),
      p(
        'Regardez deux ou trois vidéos où le Creator présente quelque chose. Comprend-on en quelques secondes à quoi sert le produit ? Montre-t-il un geste d’utilisation ou se contente-t-il de le tenir face caméra ? Ce que vous voyez là ressemble à ce que vous recevrez.',
      ),
      h3('L’adéquation avec votre public'),
      p(
        'Le ton, le décor, le rythme correspondent-ils aux personnes que vous visez ? Un excellent Creator peut être le mauvais choix si sa façon de parler ne ressemble pas à vos clients.',
      ),
      h3('La qualité d’exécution'),
      p(
        'Son audible sans musique, lumière stable, cadrage lisible sur un téléphone, montage qui va à l’essentiel. Ces points se vérifient en une minute et évitent les déceptions techniques.',
      ),
      h3('Les livrables qu’il propose'),
      p(
        'Un Creator qui propose des variantes d’accroche, des fichiers bruts ou plusieurs formats vous facilite la suite. Comparez ce qui est inclus, pas seulement le montant.',
      ),
      h3('La fiabilité de la collaboration'),
      p(
        'Les réponses sont-elles claires ? Pose-t-il des questions sur le brief ? Accepte-t-il de préciser par écrit les délais, les retouches et les droits d’usage ? Une bonne question avant le tournage vaut mieux qu’une bonne excuse après.',
      ),
      h2('La grille de comparaison'),
      p(
        'Notez chaque critère de 1 à 3 pour chaque Creator. La dernière colonne indique quels critères comptent le plus selon votre objectif.',
      ),
      table(
        ['Critère', 'Ce que vous regardez', 'Où le voir', 'Priorité'],
        [
          'Explication du produit',
          'On comprend l’usage en quelques secondes',
          'Portfolio, vidéos de démonstration',
          'UGC : forte · Influence : forte',
        ],
        [
          'Adéquation au public',
          'Ton, décor, rythme proches de vos clients',
          'Vidéos récentes, profil',
          'UGC : moyenne · Influence : forte',
        ],
        [
          'Qualité d’exécution',
          'Son, lumière, cadrage, montage',
          'Deux ou trois vidéos au hasard',
          'UGC : forte · Influence : moyenne',
        ],
        [
          'Livrables proposés',
          'Variantes, fichiers bruts, formats',
          'Proposition, échanges',
          'UGC : forte · Influence : moyenne',
        ],
        [
          'Fiabilité',
          'Réponses claires, questions sur le brief',
          'Premiers échanges',
          'UGC : forte · Influence : forte',
        ],
        [
          'Audience',
          'Composition et proximité avec vos clients',
          'Informations fournies par le Creator',
          'UGC : faible · Influence : forte',
        ],
      ),
      callout(
        'example',
        p(
          b('Exemple illustratif.'),
          ' Une marque de cosmétiques veut des vidéos pour ses publicités. Le Creator A a la plus grande audience mais ses vidéos produit sont des plans fixes sans démonstration. Le Creator B a une audience modeste, montre toujours le geste d’application et propose trois accroches. Le Creator C est proche du public visé mais son son est inaudible sans musique. Pour une commande UGC, la grille désigne B : l’audience de A ne sera pas utilisée, et le défaut de C touche un critère prioritaire.',
        ),
      ),
      h2('Les signaux qui doivent vous alerter'),
      callout(
        'warning',
        ul(
          'Un portfolio qui ne montre qu’un seul type de vidéo, sans démonstration de produit.',
          'Des statistiques d’audience que le Creator ne peut ou ne veut pas expliquer.',
          'Un refus de préciser par écrit les livrables, les délais ou les droits d’usage.',
          'Aucune question sur votre brief, même lorsqu’il laisse des points ouverts.',
        ),
      ),
      p(
        'Aucun de ces signaux n’est à lui seul rédhibitoire. Ensemble, ils annoncent en général une collaboration difficile.',
      ),
      h2('Dans AVYOR'),
      p(
        'Lorsqu’AVYOR suggère un profil pour votre campagne, il affiche les raisons de la compatibilité : spécialisation dans votre niche, présence sur vos plateformes cibles, taux d’engagement, localisation et langue, score de confiance, activité récente. Ces raisons complètent la lecture d’un portfolio, elles ne la remplacent pas. Vous pouvez ensuite constituer une présélection parmi les candidatures reçues avant de trancher ; la décision reste la vôtre.',
      ),
    ),
  },
};

/* ================================================================ Article 3 */

const portfolio = {
  id: 'portfolio001',
  slug: 'portfolio-ugc-quoi-montrer-quand-on-debute',
  icon: 'create',
  coverAlt: 'Illustration AVYOR : un clap de tournage en volume, violet, sur fond bleu nuit.',
  article: {
    title: 'Portfolio UGC : quoi montrer quand on débute',
    excerpt:
      'Pas encore de client, et une première campagne en vue ? Un portfolio montre d’abord votre façon de travailler. Cinq pièces à préparer, présentées honnêtement, et ce qu’il vaut mieux retirer.',
    type: 'guide',
    audience: 'creators',
    theme: 'create',
    author: TEAM,
    featured: false,
    cta: { label: 'Découvrir le parcours Creator', slug: 'creators' },
    related: ['premierecol1'],
    translations: {},
    sources: [],
    seo: {
      title: 'Portfolio UGC quand on débute : quoi montrer | AVYOR',
      description:
        'Sans client, un portfolio UGC montre votre façon de travailler : cinq vidéos à préparer, comment présenter des projets personnels honnêtement, et quoi retirer.',
    },
    body: doc(
      p(
        'Vous voulez candidater à votre première campagne, mais vous n’avez encore travaillé pour aucune marque. Votre galerie contient des vidéos de vacances, deux tutoriels et un unboxing tourné il y a un an. Vous hésitez à vous présenter.',
      ),
      p(
        b(
          'Un portfolio ne montre pas d’abord pour qui vous avez travaillé : il montre comment vous travaillez.',
        ),
        ' Trois à cinq vidéos courtes, réalisées pour l’occasion et présentées honnêtement comme des projets personnels, suffisent à le prouver. Voici lesquelles préparer, et comment les présenter.',
      ),
      h2('Ce qu’une marque cherche dans un portfolio'),
      p('Une marque qui parcourt votre portfolio se pose quelques questions simples :'),
      ul(
        'Sait-il faire comprendre un produit en quelques secondes ?',
        'Le son, la lumière et le cadrage sont-ils propres ?',
        'Le rythme va-t-il à l’essentiel ?',
        'Sait-il suivre une consigne sans perdre sa personnalité ?',
      ),
      p(
        'Aucune de ces questions ne demande d’avoir déjà eu un client. Elles demandent des vidéos pensées pour y répondre.',
      ),
      h2('Sans client : des projets personnels, présentés comme tels'),
      p(
        'Filmez des produits que vous possédez et utilisez vraiment, comme si une marque vous l’avait demandé. C’est la façon la plus directe de montrer votre travail. Une règle ne souffre aucune exception : ',
        b('présentez ces vidéos comme des projets personnels'),
        '. N’écrivez pas « pour la marque X » et ne laissez pas croire à une collaboration qui n’a pas eu lieu : une marque qui s’en aperçoit ne vous le pardonnera pas, et vous aurez perdu ce que le portfolio devait prouver.',
      ),
      callout(
        'example',
        p(
          b('Exemple de légende honnête : '),
          i(
            '« Projet personnel, non commandé. Objectif : montrer en 15 secondes que ce casque tient pendant la course. Contrainte que je me suis fixée : aucun texte à l’écran. »',
          ),
        ),
      ),
      h2('Cinq pièces pour un premier portfolio'),
      p(
        'Chacune prouve une compétence différente. Vous n’êtes pas obligé de toutes les faire ; trois bien choisies valent mieux que cinq bâclées.',
      ),
      table(
        ['Pièce', 'Durée indicative', 'Ce qu’elle prouve'],
        [
          'Accroche produit',
          '10 à 15 s',
          'Vous captez l’attention et posez le problème dès les premières secondes.',
        ],
        [
          'Démonstration ou tutoriel',
          '30 à 45 s',
          'Vous faites comprendre un usage, étape par étape.',
        ],
        [
          'Témoignage face caméra',
          '20 à 30 s',
          'Vous parlez naturellement d’un produit, sans lire un texte.',
        ],
        [
          'Unboxing',
          '20 à 40 s',
          'Vous mettez en valeur un objet et son emballage, sans temps mort.',
        ],
        [
          'Avant / après ou lifestyle',
          '15 à 30 s',
          'Vous montrez un résultat ou un produit dans une scène de vie crédible.',
        ],
      ),
      p(
        'Ces durées sont des repères pour une première série, pas des normes : lisez toujours les consignes de la campagne à laquelle vous répondez.',
      ),
      h2('Trois lignes de contexte sous chaque vidéo'),
      p(
        'Une vidéo sans contexte laisse la marque deviner ce que vous cherchiez. Ajoutez sous chacune :',
      ),
      ol(
        [b('L’objectif'), ' : ce que la vidéo devait faire comprendre.'],
        [b('La contrainte'), ' : la consigne que vous vous êtes imposée.'],
        [
          b('Ce que vous changeriez'),
          ' : une phrase qui montre votre regard sur votre propre travail.',
        ],
      ),
      p(
        'La troisième ligne est souvent celle qu’une marque retient : elle montre que vous savez recevoir un retour.',
      ),
      h2('Ce qu’il vaut mieux retirer'),
      ul(
        'Les vidéos dont le son n’est pas audible sans musique.',
        'Les contenus sans produit ni message, même réussis : ils ne répondent à aucune question de la marque.',
        'Les doublons : deux unboxings similaires disent la même chose.',
        'Tout ce qui pourrait laisser croire à un partenariat qui n’existe pas.',
      ),
      h2('Avant de candidater'),
      callout(
        'checklist',
        ul(
          'Trois à cinq vidéos, chacune prouvant une compétence différente.',
          'Chaque projet personnel est présenté comme tel.',
          'Chaque vidéo porte ses trois lignes de contexte.',
          'Le son est audible sans musique sur toutes les vidéos.',
          'Les formats demandés par la campagne visée sont représentés.',
        ),
      ),
      h2('Dans AVYOR'),
      p(
        'Le portfolio d’un Creator sur AVYOR classe les réalisations par type de contenu, et les photos peuvent l’alimenter sans passer par le feed. Pour préparer vos premières pièces, les modèles de vidéo guidés couvrent sept familles de formats — accroche produit, témoignage, lifestyle, unboxing, tutoriel, avant/après, storytelling — chacune avec ses étapes, sa durée et son niveau de difficulté.',
      ),
    ),
  },
};

/* ================================================================ Article 4 */

const firstCollab = {
  id: 'premierecol1',
  slug: 'premiere-collaboration-marque-points-a-clarifier',
  icon: 'collaborate',
  coverAlt:
    'Illustration AVYOR : deux bulles de conversation en volume, bleue et violette, sur fond bleu nuit.',
  article: {
    title: 'Première collaboration avec une marque : les points à clarifier',
    excerpt:
      'Une marque aime votre travail et vous propose une collaboration. Avant de dire oui, cinq points à obtenir par écrit, un modèle de message pour les demander, et ce que prévoit la loi en France.',
    type: 'guide',
    audience: 'creators',
    theme: 'prepare',
    author: TEAM,
    featured: false,
    cta: { label: 'Voir le parcours étape par étape', slug: 'how-it-works' },
    related: ['portfolio001'],
    translations: {},
    sources: [
      LOI,
      {
        title: 'Loi n° 2023-451 du 9 juin 2023 — article 8 (contrat écrit)',
        url: 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000047663198',
        publisher: 'Légifrance',
        accessed: ACCESSED,
      },
      {
        title:
          'Décret n° 2025-1137 du 28 novembre 2025 portant application de l’article 8 de la loi n° 2023-451',
        url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000052950561',
        publisher: 'Légifrance',
        accessed: ACCESSED,
      },
    ],
    seo: {
      title: 'Première collaboration avec une marque : quoi clarifier | AVYOR',
      description:
        'Livrables, calendrier, rémunération, droits d’usage, transparence : les points à obtenir par écrit avant d’accepter une première collaboration, et ce que dit la loi.',
    },
    body: doc(
      p(
        'Une marque a vu votre travail et vous propose une collaboration. C’est une bonne nouvelle, et l’envie de répondre « oui » tout de suite est naturelle. Pourtant, la plupart des difficultés d’une première collaboration viennent de ce qui n’a pas été dit au départ : une retouche de trop, un paiement plus tardif que prévu, une vidéo utilisée ailleurs qu’annoncé.',
      ),
      p(
        b(
          'Avant d’accepter, obtenez par écrit cinq points : les livrables, le calendrier et les retouches, la rémunération et son moment, les droits d’usage, et vos obligations de transparence si vous publiez.',
        ),
        ' Poser ces questions ne vous fait pas passer pour quelqu’un de difficile : c’est ce que font les Creators avec qui les marques aiment retravailler.',
      ),
      h2('1. Les livrables, précisément'),
      p(
        'Nombre de vidéos, durée, format, variantes, fichiers bruts ou non : tout ce qui n’est pas écrit risque d’être attendu. Si le brief reste vague, reformulez-le vous-même et demandez une confirmation. Une phrase comme ',
        i(
          '« Je livre deux vidéos verticales de 20 secondes, montées, avec trois accroches différentes : c’est bien ça ? »',
        ),
        ' évite la plupart des malentendus.',
      ),
      h2('2. Le calendrier et les retouches'),
      p(
        'Demandez la date de livraison, le délai de réponse de la marque et ',
        b('le nombre de séries de retouches comprises'),
        '. Distinguez une retouche — ajuster un plan, raccourcir une phrase — d’une nouvelle demande, comme un autre angle ou un autre produit. La seconde se discute à part.',
      ),
      h2('3. La rémunération : montant, forme, moment'),
      p(
        'Le montant, bien sûr, mais aussi sa forme : somme fixe, commission, produits offerts, ou un mélange. Et surtout ',
        b('le moment du paiement'),
        ' : à la commande, à la livraison, après validation ? Un produit offert n’est pas une rémunération neutre : c’est un avantage en nature, et la loi française le compte comme tel.',
      ),
      h2('4. Les droits d’usage'),
      p(
        'Où la marque utilisera-t-elle votre vidéo, pendant combien de temps, dans quels pays ? Sur ses réseaux, en publicité payante, sur son site ? Ces droits ont une valeur. Un usage publicitaire de longue durée ne se négocie pas comme une publication unique sur le compte de la marque.',
      ),
      h2('5. Si vous publiez sur votre compte : la transparence'),
      p(
        'Lorsque vous faites la promotion d’un produit auprès de votre propre audience, il s’agit d’influence commerciale. En France, la loi impose alors la mention « Publicité » ou « Collaboration commerciale », ',
        i('claire, lisible et identifiable'),
        ' pendant toute la durée de la promotion (',
        a('loi n° 2023-451, article 5', LOI.url),
        ').',
      ),
      p(
        'La même loi impose un ',
        b('contrat écrit'),
        ', avec des mentions précises — identité des parties, nature des missions, rémunération ou valeur des avantages en nature, droits et obligations de chacun — lorsque les rémunérations et avantages versés par un même annonceur sur une année, pour un même objectif promotionnel, atteignent ',
        b('1 000 € hors taxes'),
        '. Ce seuil a été fixé par le ',
        a('décret n° 2025-1137', 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000052950561'),
        ', en vigueur depuis le 1er janvier 2026.',
      ),
      callout(
        'warning',
        p(
          'Ces règles s’appliquent en France et évoluent : la loi a déjà été modifiée depuis son adoption, notamment par l’ordonnance n° 2024-978. Vérifiez la version en vigueur sur Légifrance au moment de signer. Cet article vous aide à poser les bonnes questions ; il ne remplace pas un conseil juridique pour votre situation.',
        ),
      ),
      p(
        'Si vous livrez une vidéo que seule la marque publiera, sans la diffuser vous-même, la situation est différente : clarifiez avec elle qui publie, où, et sous quelle mention.',
      ),
      h2('Un message pour clarifier, prêt à adapter'),
      callout(
        'example',
        p(
          i(
            '« Merci pour votre proposition, votre produit m’intéresse. Avant de confirmer, pouvez-vous me préciser : le nombre de vidéos, leur durée et leur format ; la date de livraison et le nombre de retouches comprises ; la rémunération et le moment du paiement ; où et pendant combien de temps vous utiliserez la vidéo ; et si vous attendez une publication sur mon compte ? Dès que j’ai ces éléments, je vous confirme. »',
          ),
        ),
      ),
      h2('Avant d’accepter'),
      callout(
        'checklist',
        ul(
          'Les livrables sont écrits : nombre, durée, format, variantes.',
          'La date de livraison et le nombre de retouches comprises sont fixés.',
          'Le montant, sa forme et le moment du paiement sont connus.',
          'Les droits d’usage — supports, durée, pays — sont précisés.',
          'Vous savez si vous publiez sur votre compte, et avec quelle mention.',
          'Un contrat écrit existe si le seuil légal est atteint.',
        ),
      ),
      h2('Dans AVYOR'),
      p(
        'Sur AVYOR, le montant se discute dans la conversation avec la marque, et chacun peut faire une contre-offre. La collaboration ne démarre qu’une fois la proposition acceptée ; la marque paie alors, et la somme est conservée par AVYOR jusqu’à ce qu’elle valide votre livrable. Un point à connaître avant de candidater : ',
        b('une candidature envoyée ne peut pas être retirée depuis l’application'),
        '. Posez vos questions avant, dans la conversation.',
      ),
    ),
  },
};

export const articles = [brief, choose, portfolio, firstCollab];

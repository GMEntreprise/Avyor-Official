export interface Section {
  title: string;
  body: string;
  items?: string[];
}
export interface Page {
  slug: string;
  label: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  screen?: string;
  noindex?: boolean;
}
export const facts =
  'AVYOR est une plateforme mobile de collaboration entre Creators et marques. Découvrez des profils, lancez des campagnes et suivez vos projets au même endroit.';
export const faqs = [
  {
    q: 'Qu’est-ce qu’AVYOR ?',
    a: facts,
  },
  {
    q: 'À qui s’adresse AVYOR ?',
    a: 'Aux Creators qui souhaitent montrer leur travail et trouver des collaborations, et aux marques qui cherchent des profils pour leurs campagnes de contenu. Le rôle se choisit à l’inscription.',
  },
  {
    q: 'AVYOR est-il gratuit ?',
    a: 'Créer un compte, publier son profil, explorer les campagnes et découvrir des profils ne sont pas payants. Les échanges financiers concernent les collaborations : la marque finance le projet, le Creator est payé après validation du livrable. Les montants et frais applicables sont affichés dans l’application avant tout engagement.',
  },
  {
    q: 'Comment créer une campagne ?',
    a: 'Un assistant en quatre étapes vous guide : informations (visuel, titre, catégorie, description, objectif), budget (enveloppe totale et montant par Creator, en modèle fixe, commission ou mixte), ciblage (plateformes, audience, échéance), puis révision du brief complet avant publication.',
  },
  {
    q: 'Comment rejoindre une campagne ?',
    a: 'Depuis l’onglet Campagnes, filtrez selon vos niches et vos plateformes, lisez le brief et les conditions, puis envoyez votre candidature. Son statut évolue ensuite sous vos yeux : en attente, en cours d’examen, présélectionnée, acceptée, refusée ou terminée.',
  },
  {
    q: 'Puis-je annuler une candidature ?',
    a: 'Pas depuis l’application pour le moment : une candidature envoyée ne peut pas être retirée. Si vous ne souhaitez plus donner suite, dites-le à la marque dans la conversation ; elle peut clore la candidature de son côté.',
  },
  {
    q: 'Comment fonctionne le matching ?',
    a: 'AVYOR rapproche les informations d’un profil et celles d’une campagne, puis affiche les raisons de la compatibilité : spécialisation dans la niche, présence sur les plateformes ciblées, taux d’engagement, localisation et langue, score de confiance, activité récente. La marque consulte ces raisons et reste libre de son choix.',
  },
  {
    q: 'Comment se déroule une collaboration ?',
    a: 'Une marque vous contacte, ou vous candidatez à une campagne. Vous vous accordez sur le montant dans la conversation, chacun pouvant faire une contre-offre. Une fois la proposition acceptée, la marque paie : la somme est conservée par AVYOR jusqu’à ce qu’elle valide le livrable.',
  },
  {
    q: 'Comment et quand suis-je payé ?',
    a: 'Le versement part à la validation du livrable par la marque, jamais avant. La somme passe alors sur votre solde Stripe, puis vers votre compte bancaire selon le calendrier de versement de ce compte. L’écran de versement distingue ces étapes pour chaque collaboration. Aucun délai n’est garanti par AVYOR : il dépend du prestataire de paiement.',
  },
  {
    q: 'Puis-je créer une vidéo depuis l’application ?',
    a: 'Oui. Des modèles guidés couvrent sept familles de formats — accroche produit, témoignage, lifestyle, unboxing, tutoriel, avant/après, storytelling — chacun avec ses étapes, sa durée et son niveau de difficulté. Le studio accompagne l’enregistrement, le choix de la couverture et la relecture avant publication.',
  },
  {
    q: 'Comment sécuriser mon compte ?',
    a: 'Les réglages de sécurité permettent de changer votre mot de passe avec un indicateur de robustesse, de modifier votre adresse e-mail avec vérification, et de consulter vos sessions connectées. L’authentification et les changements sensibles passent par Supabase.',
  },
  {
    q: 'Comment signaler un contenu ou bloquer un compte ?',
    a: 'Le signalement et le blocage sont accessibles directement depuis une vidéo, une conversation ou un profil. Un motif est demandé : spam, faux compte, harcèlement, violence, contenu sexuel non sollicité, fraude, atteinte aux droits d’auteur, ou autre. L’équipe examine chaque signalement.',
  },
  {
    q: 'Comment supprimer mon compte ?',
    a: 'Depuis Réglages, puis Sécurité, choisissez la suppression du compte. L’action est irréversible et demande une confirmation écrite explicite. Terminez vos collaborations en cours au préalable : certains éléments liés à un paiement doivent être conservés pour des raisons légales.',
  },
  {
    q: 'AVYOR est-il disponible sur iOS et Android ?',
    a: 'AVYOR est une application mobile prévue pour iOS et Android. Le lancement public se prépare : les liens officiels App Store et Google Play seront affichés sur la page de téléchargement dès leur disponibilité. Aucun fichier d’installation n’est distribué en dehors de ces deux magasins.',
  },
  {
    q: 'Comment contacter AVYOR ?',
    a: 'Écrivez à l’adresse de contact officielle indiquée sur la page Contact, en précisant si vous êtes Creator ou si vous représentez une marque. Ne transmettez ni mot de passe ni coordonnées bancaires complètes.',
  },
  {
    q: 'Les captures présentent-elles de vrais utilisateurs ?',
    a: 'Les captures montrent les écrans AVYOR avec des données de démonstration. Les profils, marques, montants et statistiques illustrent les parcours ; ils ne constituent pas des témoignages ou des résultats clients.',
  },
];
export const scenes = [
  {
    id: '02-matching',
    label: 'Découvrir',
    heading: 'Un style se reconnaît. Il ne se résume pas.',
    body: 'Parcourez les profils, regardez les créations et trouvez les univers qui correspondent à votre projet.',
    tag: '01 / DISCOVER',
  },
  {
    id: '03-match-detail',
    label: 'Matcher',
    heading: 'Comprendre pourquoi ça peut fonctionner.',
    body: 'Consultez les informations de compatibilité entre un Creator et votre campagne. La décision vous appartient.',
    tag: '02 / MATCH',
  },
  {
    id: '05-campaign',
    label: 'Créer une campagne',
    heading: 'Une bonne création commence par un brief clair.',
    body: 'Présentez votre projet, le contenu attendu et les conditions de la collaboration dans une campagne.',
    tag: '03 / CAMPAIGN',
  },
  {
    id: '06-collaboration',
    label: 'Collaborer',
    heading: 'Du premier échange au dernier livrable.',
    body: 'Gardez les messages et les étapes du projet dans un même espace, pour avancer avec le même contexte.',
    tag: '04 / COLLABORATE',
  },
];
export const pages: Page[] = [
  {
    slug: '',
    label: 'Accueil',
    title: 'AVYOR — Creators et marques, connectés par la création',
    description:
      'Le bon Creator. La bonne campagne. Découvrez AVYOR, l’application mobile qui réunit découverte vidéo, campagnes, portfolio et collaborations entre Creators et marques.',
    eyebrow: 'LA CRÉATION FAIT LA RENCONTRE',
    heading: 'Le bon Creator. La bonne campagne.',
    intro: facts,
  },
  {
    slug: 'creators',
    label: 'Creators',
    title: 'Creators : portfolio, campagnes et paiements | AVYOR',
    description:
      'Publiez vos vidéos avec des modèles guidés, montez votre portfolio, candidatez aux campagnes, négociez le montant dans la conversation et suivez votre versement après validation.',
    eyebrow: 'POUR LES CREATORS',
    heading: 'Votre travail mérite les bonnes rencontres.',
    intro:
      'Votre univers, vos vidéos, votre façon de créer. AVYOR vous donne de quoi les montrer, trouver des campagnes qui vous correspondent et mener la collaboration jusqu’au versement.',
    screen: '08-portfolio',
  },
  {
    slug: 'brands',
    label: 'Marques',
    title: 'Marques : lancez une campagne et trouvez des Creators | AVYOR',
    description:
      'Créez votre campagne en quatre étapes, ciblez plateformes et audience, lisez les raisons de compatibilité de chaque profil, présélectionnez et validez les livrables avant versement.',
    eyebrow: 'POUR LES MARQUES',
    heading: 'Le bon regard pour raconter votre marque.',
    intro:
      'Regardez ce que les Creators font vraiment, puis construisez une campagne avec un brief clair, un ciblage précis et un cadre de collaboration lisible des deux côtés.',
    screen: '02-matching',
  },
  {
    slug: 'features',
    label: 'Produit',
    title: 'Le produit AVYOR : découvrir, créer, collaborer, piloter',
    description:
      'Feed vidéo, recherche par niche, modèles de vidéo guidés, portfolio, séries et stories, campagnes, messagerie avec contre-offre, suivi des versements et parcours de progression.',
    eyebrow: 'LE PRODUIT',
    heading: 'Voir. Se trouver. Créer ensemble.',
    intro:
      'Quatre moments : découvrir les créations, créer les vôtres, collaborer avec un cadre, piloter ce qui avance.',
    screen: '04-feed',
  },
  {
    slug: 'how-it-works',
    label: 'Comment ça marche',
    title: 'Comment ça marche sur AVYOR — Creator ou marque',
    description:
      'Les deux parcours AVYOR, étape par étape : profil, publication, campagnes, candidature, accord sur le montant, livrable, validation et versement. Cinq étapes de chaque côté.',
    eyebrow: 'COMMENT ÇA MARCHE',
    heading: 'Une rencontre. Un brief. Un projet.',
    intro: 'Deux points de départ, cinq étapes chacun, un espace commun pour créer ensemble.',
    screen: '05-campaign',
  },
  {
    slug: 'security',
    label: 'Sécurité',
    title: 'Compte, paiements et signalement sur AVYOR',
    description:
      'Réglages de sécurité du compte, suppression définitive, paiement conservé jusqu’à validation du livrable, suivi du versement, motifs de signalement et blocage dans AVYOR.',
    eyebrow: 'CONFIANCE & CONTRÔLE',
    heading: 'Créer ensemble, avec des règles claires.',
    intro:
      'Comprendre ce qui est partagé, comment un paiement avance, et où agir quand quelque chose ne va pas.',
    screen: '07-payment',
  },
  {
    slug: 'faq',
    label: 'FAQ',
    title: 'Questions fréquentes sur AVYOR — produit, paiement, compte',
    description:
      'Comment fonctionnent les campagnes, le matching, la négociation et les paiements sur AVYOR ? Comment sécuriser ou supprimer son compte ? Les réponses, vérifiées dans l’application.',
    eyebrow: 'LES RÉPONSES',
    heading: 'Avant de faire la rencontre.',
    intro:
      'Les informations utiles pour comprendre AVYOR et préparer votre première collaboration.',
  },
  {
    slug: 'download',
    label: 'Télécharger',
    title: 'Télécharger AVYOR — lancement sur iOS et Android',
    description:
      'Retrouvez ici les liens de téléchargement officiels d’AVYOR pour iOS et Android dès leur publication. Découvrez le produit et contactez l’équipe.',
    eyebrow: 'AVYOR, BIENTÔT ENTRE VOS MAINS',
    heading: 'La prochaine rencontre commence ici.',
    intro:
      'AVYOR est une application mobile pour iOS et Android. Le lancement public se prépare : les liens officiels App Store et Google Play apparaîtront ici dès leur publication.',
    screen: '04-feed',
  },
  {
    slug: 'privacy',
    label: 'Confidentialité',
    title: 'Politique de confidentialité AVYOR — données et droits',
    description:
      'Consultez la politique de confidentialité de l’application AVYOR : données, finalités, prestataires, conservation et contact pour exercer vos droits.',
    eyebrow: 'VOS DONNÉES',
    heading: 'Politique de confidentialité.',
    intro:
      'Retrouvez les informations de confidentialité de l’application et celles propres à ce site de présentation.',
    noindex: true,
  },
  {
    slug: 'terms',
    label: 'Conditions d’utilisation',
    title: 'Conditions d’utilisation AVYOR — comptes et collaborations',
    description:
      'Consultez les conditions d’utilisation AVYOR : comptes, contenus, campagnes, droits d’usage, règles de conduite, collaborations et paiements.',
    eyebrow: 'LES RÈGLES',
    heading: 'Conditions d’utilisation.',
    intro:
      'Les règles qui encadrent l’utilisation de l’application AVYOR et les collaborations entre Creators et marques.',
    noindex: true,
  },
  {
    slug: 'contact',
    label: 'Contact',
    title: 'Contacter AVYOR — produit, support et confidentialité',
    description:
      'Contactez l’équipe AVYOR pour une question sur le produit, une collaboration ou vos données personnelles, à l’adresse officielle du support.',
    eyebrow: 'PARLONS-EN',
    heading: 'Une question ? Échangeons.',
    intro:
      'Une question sur AVYOR, un projet de campagne ou besoin d’aide avec votre compte ? Contactez l’équipe.',
  },
  {
    slug: 'legal',
    label: 'Mentions légales',
    title: 'Mentions légales AVYOR — éditeur et contact',
    description:
      'Informations disponibles sur l’éditeur du produit AVYOR, la propriété intellectuelle et le contact officiel. Document en préparation pour le lancement.',
    eyebrow: 'INFORMATIONS ÉDITEUR',
    heading: 'Mentions légales.',
    intro:
      'AVYOR est un produit mobile opéré par Shavod. Les informations de publication sont réunies sur cette page.',
    noindex: true,
  },
];
/** Contextual next step per page: each one leads somewhere that answers the question it raises. */
export const relatedLinks: Record<string, { lead: string; links: [string, string][] }> = {
  creators: {
    lead: 'La suite du parcours Creator.',
    links: [
      ['Le parcours étape par étape', '/how-it-works/'],
      ['Le produit en détail', '/features/'],
      ['Paiements et sécurité', '/security/'],
    ],
  },
  brands: {
    lead: 'Aller plus loin côté marque.',
    links: [
      ['Le produit en détail', '/features/'],
      ['Le parcours étape par étape', '/how-it-works/'],
      ['Paiements et sécurité', '/security/'],
    ],
  },
  features: {
    lead: 'Voir le produit à l’œuvre.',
    links: [
      ['Le parcours étape par étape', '/how-it-works/'],
      ['Pour les Creators', '/creators/'],
      ['Télécharger l’app', '/download/'],
    ],
  },
  'how-it-works': {
    lead: 'Choisir son point de départ.',
    links: [
      ['Pour les Creators', '/creators/'],
      ['Pour les marques', '/brands/'],
      ['Questions fréquentes', '/faq/'],
    ],
  },
  security: {
    lead: 'Les documents qui font référence.',
    links: [
      ['Politique de confidentialité', '/privacy/'],
      ['Conditions d’utilisation', '/terms/'],
      ['Questions fréquentes', '/faq/'],
    ],
  },
  faq: {
    lead: 'Les règles et les documents.',
    links: [
      ['Paiements et sécurité', '/security/'],
      ['Politique de confidentialité', '/privacy/'],
      ['Conditions d’utilisation', '/terms/'],
    ],
  },
  download: {
    lead: 'Découvrir AVYOR avant de l’installer.',
    links: [
      ['Le produit en détail', '/features/'],
      ['Le parcours étape par étape', '/how-it-works/'],
      ['Questions fréquentes', '/faq/'],
    ],
  },
  contact: {
    lead: 'Peut-être que la réponse est déjà là.',
    links: [
      ['Questions fréquentes', '/faq/'],
      ['Paiements et sécurité', '/security/'],
      ['Télécharger l’app', '/download/'],
    ],
  },
};
export const navigation = [
  ['Produit', '/features/'],
  ['Creators', '/creators/'],
  ['Marques', '/brands/'],
  ['Sécurité', '/security/'],
  ['FAQ', '/faq/'],
] as const;
export const hrefFor = (slug: string) => (slug ? `/${slug}/` : '/');

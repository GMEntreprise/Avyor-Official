import type { Section } from './site';

/**
 * Long-form page bodies. They live apart from `site.ts` because only one inner
 * page ever needs them, and their text is already in the prerendered HTML — so
 * the client fetches this on demand instead of shipping it to every visitor.
 */
export const sectionsBySlug: Record<string, Section[]> = {
  creators: [
    {
      title: 'Un portfolio qui parle pour vous.',
      body: 'Rassemblez vos projets dans votre profil : vidéos UGC, démonstrations produit, témoignages, unboxings, tutoriels ou photos. Une marque découvre votre style avant le premier message.',
      items: [
        'Présentez votre univers, vos niches et vos plateformes.',
        'Classez vos réalisations par type de contenu.',
        'Gardez vos projets accessibles depuis votre profil.',
      ],
    },
    {
      title: 'Créer sans partir de zéro.',
      body: 'L’application propose des modèles de vidéo guidés, classés par catégorie — accroche produit, témoignage, lifestyle, unboxing, tutoriel, avant/après, storytelling. Chaque modèle annonce son nombre d’étapes, sa durée et son niveau de difficulté. Le studio vous accompagne du tournage au choix de la couverture.',
    },
    {
      title: 'Séries et stories.',
      body: 'Un format qui se prolonge se publie en série, épisode après épisode. Les stories permettent un contenu plus court et thématique. Vos formats longs et courts vivent dans le même profil.',
    },
    {
      title: 'Des campagnes à explorer.',
      body: 'Parcourez les campagnes ouvertes, triées par pertinence, nouveauté ou popularité, et filtrez-les par catégorie, plateforme ou format à distance. Chaque campagne affiche son brief, ses conditions et son score de correspondance avec votre profil.',
      items: [
        'Vos niches et vos plateformes alimentent ce score.',
        'Le budget et l’échéance sont annoncés avant de candidater.',
        'Vos campagnes favorites restent accessibles.',
      ],
    },
    {
      title: 'Candidater, puis suivre sa réponse.',
      body: 'Une candidature envoyée avance par étapes visibles : en attente, en cours d’examen, présélectionnée, acceptée, refusée ou terminée. Vous savez où vous en êtes sans relancer. Une candidature envoyée ne peut pas être retirée depuis l’application : si vous changez d’avis, dites-le à la marque dans la conversation.',
    },
    {
      title: 'Le montant se discute dans la conversation.',
      body: 'Rien n’est imposé. Vous et la marque vous accordez sur la rémunération dans la messagerie, et chacun peut faire une contre-offre. La collaboration ne démarre qu’une fois la proposition acceptée.',
    },
    {
      title: 'Un projet suivi jusqu’au livrable.',
      body: 'Une fois la proposition acceptée, la marque paie et la somme est conservée par AVYOR jusqu’à la validation de votre livrable. Conversation, étapes et livrables restent réunis au même endroit.',
    },
    {
      title: 'Être payé après validation.',
      body: 'Votre rémunération part à la validation du livrable, jamais avant. L’écran de versement distingue chaque étape : paiement de la collaboration, livrable validé, versement sur votre solde Stripe, puis virement vers votre banque. Ce dernier délai dépend du calendrier de votre compte Stripe.',
    },
    {
      title: 'Votre activité prend forme.',
      body: 'Votre parcours réunit votre progression, vos missions, vos badges et votre chronologie d’activité. Vos statistiques suivent vues, likes, enregistrements, abonnés, portfolio et campagnes — pour comprendre ce qui fonctionne, sans promesse de visibilité ni de revenu.',
    },
  ],
  brands: [
    {
      title: 'Commencez par la création.',
      body: 'Le feed vidéo montre les styles, les formats et les univers. Passez d’un contenu au profil de son Creator, puis à son portfolio, pour juger sur le travail plutôt que sur une présentation.',
    },
    {
      title: 'Un assistant de campagne en quatre étapes.',
      body: 'Créer une campagne se fait pas à pas : informations, budget, ciblage, puis révision avant publication. Chaque étape est vérifiée, ce qui évite de publier un brief incomplet.',
      items: [
        'Informations : visuel, titre, catégorie, description, objectif.',
        'Budget : enveloppe totale et montant par Creator.',
        'Ciblage : plateformes, audience, échéance.',
        'Révision : tout le brief relu avant publication.',
      ],
    },
    {
      title: 'Choisissez votre modèle de rémunération.',
      body: 'Une campagne peut être rémunérée de façon fixe, à la commission, ou selon un modèle mixte. Vous fixez l’enveloppe totale et le montant par Creator ; l’application vérifie que les deux restent cohérents.',
    },
    {
      title: 'Ciblez qui vous voulez atteindre.',
      body: 'Précisez les plateformes visées, la tranche d’âge, le genre et le nombre d’abonnés attendu, ainsi que l’échéance de la campagne. Ces critères servent à proposer votre campagne aux profils pertinents.',
    },
    {
      title: 'Des recommandations que vous pouvez lire.',
      body: 'Le score de compatibilité s’explique. Chaque profil suggéré indique pourquoi il vous correspond : spécialisation dans votre niche, présence sur vos plateformes cibles, taux d’engagement, localisation et langue compatibles, score de confiance, activité récente. Vous gardez la décision.',
      items: [
        'Les raisons sont affichées, pas seulement le score.',
        'Vous pouvez filtrer et trier les profils vous-même.',
        'Le matching complète la lecture d’un portfolio, il ne la remplace pas.',
      ],
    },
    {
      title: 'Trier les candidatures.',
      body: 'Les candidatures reçues se suivent par statut : en attente, en cours d’examen, présélectionnée, acceptée, refusée, terminée. Vous pouvez constituer une shortlist des profils retenus avant de trancher.',
    },
    {
      title: 'S’accorder sur le montant.',
      body: 'La rémunération se discute avec le Creator dans la conversation, et chacun peut faire une contre-offre. Une fois la proposition acceptée, vous payez : la somme est conservée par AVYOR jusqu’à ce que vous validiez le livrable.',
    },
    {
      title: 'Suivre la collaboration et valider.',
      body: 'Échangez, suivez les étapes et recevez les livrables dans le parcours prévu. Le versement au Creator part à votre validation. Votre tableau de bord réunit vos campagnes lancées, vos collaborations et votre activité.',
    },
  ],
  features: [
    {
      title: 'Découvrir — le feed vidéo.',
      body: 'Le point d’entrée du produit est la création elle-même. Les contenus se parcourent en vidéo, et chacun mène au profil de son auteur puis à son portfolio.',
    },
    {
      title: 'Découvrir — chercher et filtrer.',
      body: 'Campagnes et profils se filtrent par catégorie parmi dix-neuf niches, par plateforme, par format à distance ou par mise en avant. Les campagnes se trient par pertinence, nouveauté ou popularité, et se mettent en favori.',
    },
    {
      title: 'Créer — modèles guidés et studio.',
      body: 'Sept familles de modèles vidéo accompagnent la réalisation, chacune avec ses étapes, sa durée et son niveau de difficulté. Le studio couvre l’enregistrement, le montage simple, le choix de la couverture et la relecture avant publication.',
    },
    {
      title: 'Créer — portfolio, séries et stories.',
      body: 'Un portfolio classe vos réalisations par type de contenu. Les séries enchaînent les épisodes d’un même format ; les stories accueillent un contenu plus court. Les photos alimentent le portfolio sans passer par le feed.',
    },
    {
      title: 'Collaborer — campagnes et candidatures.',
      body: 'Une campagne rassemble le brief, les conditions et l’échéance. Les candidatures avancent par statuts visibles des deux côtés, et la marque peut présélectionner les profils qu’elle retient.',
    },
    {
      title: 'Collaborer — messagerie et accord.',
      body: 'La conversation porte le projet : c’est là que le montant se négocie, contre-offre comprise, et que le contexte reste disponible pendant toute la collaboration.',
    },
    {
      title: 'Piloter — paiement et versement.',
      body: 'La somme convenue est conservée par AVYOR jusqu’à la validation du livrable. Le suivi distingue le paiement, la validation, le versement sur le solde Stripe et le virement bancaire.',
    },
    {
      title: 'Piloter — parcours et statistiques.',
      body: 'Missions, badges, niveaux, projets et chronologie donnent une lecture de votre activité dans la durée. Les statistiques détaillent vues, likes, enregistrements, abonnés, portfolio et campagnes.',
    },
  ],
  'how-it-works': [
    {
      title: 'Creator — créez votre profil.',
      body: 'À l’inscription, vous choisissez votre rôle, puis vous renseignez votre activité, vos objectifs, vos niches, vos plateformes, votre pays et votre langue. Ces informations alimentent directement les campagnes qui vous seront proposées.',
    },
    {
      title: 'Creator — publiez votre travail.',
      body: 'Tournez avec un modèle guidé ou depuis le studio, choisissez votre couverture, puis publiez. Vos réalisations rejoignent votre profil et votre portfolio.',
    },
    {
      title: 'Creator — explorez les campagnes.',
      body: 'Parcourez les campagnes ouvertes, filtrez-les et lisez le brief : contenus attendus, conditions, budget, échéance et score de correspondance.',
    },
    {
      title: 'Creator — candidatez et accordez-vous.',
      body: 'Envoyez votre candidature, suivez son statut, puis discutez du montant dans la conversation. Chacun peut faire une contre-offre jusqu’à l’accord.',
    },
    {
      title: 'Creator — livrez et recevez.',
      body: 'Remettez votre livrable dans l’espace de collaboration. Une fois validé, votre rémunération part vers votre solde Stripe, puis vers votre banque.',
    },
    {
      title: 'Marque — décrivez votre activité.',
      body: 'À l’inscription, vous renseignez votre organisation, votre secteur, votre objectif, le type de Creators recherché et votre ordre de budget.',
    },
    {
      title: 'Marque — créez votre campagne.',
      body: 'L’assistant vous guide en quatre étapes : informations, budget, ciblage, révision. Vous relisez tout le brief avant de publier.',
    },
    {
      title: 'Marque — découvrez et présélectionnez.',
      body: 'Explorez le feed, filtrez les profils, lisez les raisons de compatibilité proposées et constituez votre shortlist parmi les candidatures reçues.',
    },
    {
      title: 'Marque — accordez-vous et financez.',
      body: 'Convenez du montant dans la conversation, contre-offre comprise. À l’acceptation, vous payez : la somme est conservée par AVYOR jusqu’à votre validation.',
    },
    {
      title: 'Marque — validez et versez.',
      body: 'Recevez le livrable, demandez un ajustement si besoin, puis validez. Le versement au Creator est déclenché à ce moment-là.',
    },
  ],
  security: [
    {
      title: 'Votre compte.',
      body: 'L’authentification et les changements sensibles passent par Supabase. Depuis les réglages de sécurité, vous pouvez changer votre mot de passe — avec un indicateur de robustesse —, changer votre adresse e-mail avec vérification par message, et consulter vos sessions connectées.',
    },
    {
      title: 'Supprimer votre compte.',
      body: 'La suppression se fait depuis Réglages, puis Sécurité. L’action est irréversible et demande une confirmation écrite explicite avant d’être exécutée. Terminez vos collaborations en cours au préalable : certains éléments liés à un paiement doivent être conservés pour des raisons légales.',
    },
    {
      title: 'Ce que votre profil montre.',
      body: 'Profil, vidéos et portfolio sont destinés à être vus : c’est la fonction du produit. Les conversations, elles, ne sont visibles que de leurs destinataires. Vos préférences de notification et d’affichage se règlent dans l’application.',
    },
    {
      title: 'Le paiement est conservé jusqu’à validation.',
      body: 'Une fois la proposition acceptée, la marque paie et la somme est conservée par AVYOR. Elle n’est versée au Creator qu’après validation du livrable. Ni le Creator ni la marque ne détiennent les fonds entre-temps.',
    },
    {
      title: 'Le versement, étape par étape.',
      body: 'Quatre états sont affichés : paiement de la collaboration, livrable validé, versement sur le solde Stripe, virement bancaire. Le délai du dernier dépend du calendrier de versement du compte Stripe du Creator ; aucun délai n’est promis.',
    },
    {
      title: 'Signaler un contenu ou un compte.',
      body: 'Le signalement est accessible depuis une vidéo, une conversation ou un profil, avec un motif à préciser.',
      items: [
        'Spam, faux compte ou usurpation d’identité.',
        'Harcèlement, violence, contenu sexuel non sollicité.',
        'Fraude ou atteinte aux droits d’auteur.',
        'Autre motif, avec un commentaire libre.',
      ],
    },
    {
      title: 'Bloquer un utilisateur.',
      body: 'Le blocage s’effectue au même endroit que le signalement et interrompt l’interaction. Il reste réversible depuis vos réglages.',
    },
    {
      title: 'Un problème pendant une collaboration ?',
      body: 'Contactez le support en précisant le projet concerné. N’envoyez jamais de mot de passe ni de coordonnées bancaires complètes par e-mail. Pour un contenu ou un comportement abusif, utilisez le signalement dans l’application : il parvient directement à l’équipe.',
    },
  ],
  download: [
    {
      title: 'Ce que vous pouvez faire dans l’app.',
      body: 'AVYOR réunit en une seule application les étapes qui vont de la découverte d’un profil au livrable validé.',
      items: [
        'Découvrir : parcourir le feed vidéo et les profils Creator.',
        'Campagnes : publier un brief ou explorer ceux qui sont ouverts.',
        'Collaboration : suivre les étapes d’un projet et ses livrables.',
        'Portfolio : rassembler vos créations dans un profil qui vous représente.',
        'Messages : garder les échanges d’un projet avec leur contexte.',
      ],
    },
    {
      title: 'Creator ou marque ?',
      body: 'Le parcours s’adapte à votre activité : présenter votre travail et répondre à des campagnes côté Creator, décrire un projet et découvrir des profils côté marque. Le choix se fait à la création du compte et reste modifiable depuis vos paramètres.',
    },
    {
      title: 'Sur quels appareils ?',
      body: 'AVYOR est une application mobile, prévue pour iOS et Android. Les liens officiels App Store et Google Play apparaîtront sur cette page dès la publication : aucun lien de téléchargement n’est affiché avant d’être vérifié, et aucun fichier d’installation n’est distribué en dehors des deux magasins.',
    },
    {
      title: 'Combien ça coûte ?',
      body: 'La création d’un compte et la découverte des profils comme des campagnes ne sont pas payantes. Les échanges financiers concernent les collaborations elles-mêmes : la marque finance le projet et le Creator reçoit son paiement après validation du livrable. Les montants et frais applicables sont présentés dans l’application avant tout engagement.',
    },
    {
      title: 'Une question avant de commencer ?',
      body: 'L’équipe peut répondre à vos questions sur le produit. Écrivez à l’adresse de contact officielle, sans transmettre de mot de passe ni de coordonnées bancaires.',
    },
  ],
  contact: [
    {
      title: 'Pour une question sur le produit.',
      body: 'Précisez si vous êtes Creator ou si vous représentez une marque, puis décrivez votre besoin. Cela nous aide à vous répondre avec le bon contexte.',
    },
    {
      title: 'Pour votre compte ou vos données.',
      body: 'Indiquez l’adresse associée à votre compte et la nature de la demande. Ne transmettez ni mot de passe ni informations de carte bancaire.',
    },
    {
      title: 'Pour signaler un contenu.',
      body: 'Un contenu ou un compte abusif se signale directement dans l’application, depuis la vidéo, la conversation ou le profil concerné : c’est la voie la plus rapide. Écrivez-nous si le signalement n’est pas possible.',
    },
  ],
};

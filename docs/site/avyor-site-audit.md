# Audit AVYOR Web — 17 septembre 2026

## Architecture et périmètre
Nouveau projet autonome `Avyor-Official`, React + Vite + TypeScript strict conformément à la demande prioritaire. L'app Expo `Avyor` reste une source en lecture seule. Bun ; pré-rendu React serveur au build pour chaque route, hydratation des interactions côté navigateur. Pas de backend requis pour une vitrine et des liens de téléchargement.

## Sources examinées
Tous les modules Markdown de SEO_BOOSTER ; les deux PDF sont également conservés. Le dossier SEO_BOOSTER est recopié intégralement. Les scripts TselCloud sont archivés intégralement sous scripts/upstream/tselcloud, sans exécution des scripts propres à sa base de données. Le générateur de marque est conservé comme référence. `webp.mjs`, absent de TselCloud, provient de Shavod-Official/scripts.

## Identité et assets
Palette attestée : Avyor/src/theme/colors.ts, fond #0B1020, accent #7C5CFF, surfaces #1A1F2E. Le fichier src/assets/images/avyor-logo.png est un placeholder texte et ne peut pas servir de master. Le vrai PNG RGBA 1024 × 1024 se trouve dans assets/avyor.icon/Assets/avyor-logo.png. Pas de master vectoriel : conserver ses pixels et son alpha ; SVG mask contenant l'image, sans vectorisation ni redessin.

Captures : huit PNG 1320 × 2868 dans store-assets/source/ios-real. Utiliser feed, matching, match-detail, campaign, collaboration, payment, portfolio. L'ancien rapport final est explicitement supersédé ; la revue courante atteste l'emploi des vrais composants de production et de NativeTabs. Les personnes, montants et statistiques sont des fixtures éditoriales, jamais des résultats clients. Légende visible obligatoire.

Aucune vidéo marketing fournie : produire une boucle de présentation à partir de ces captures et des médias de démonstration fournis, sans prétendre à un enregistrement de session réelle. Conserver les ratios, aucun agrandissement des exports.

## Faits produit
Découverte, matching, campagnes, portfolio, messagerie et livrables attestés par les écrans et composants. create-collaboration-payment et release-collaboration-payout décrivent un encaissement puis un transfert après validation, via Stripe Connect. Ne pas promettre de délai de virement ni de séquestre bancaire.
Domaine avyor.app attesté dans app.config.ts et deepLinks.ts ; à confirmer avant publication officielle. Adresse réelle : shavod.web@gmail.com (config/runtime.ts). Aucun lien public de store trouvé : mode Bientôt disponible configurable.

## SEO initial et risques
Aucun site existant dans ce nouveau dossier. Baseline : zéro page générée, zéro metadata. Tests RED attendus pour toutes les routes avant implémentation. FR uniquement, pas de hreflang artificiel. Les mentions légales et conditions de l'app portent des informations éditeur à compléter : reprendre les textes existants avec leur état explicite, sans inventer d'identifiants ; pas de publication publique officielle avant validation.

## Références et décision
Insyder.io inaccessible lors de la consultation initiale ; ne pas prétendre avoir analysé ses animations. Nova Glow référencé sur le catalogue Framer : retenir navigation flottante, contour discret, état actif. Device Mockups 2026 est payant et spécifique à Framer : créer un cadre simple original, sans reprendre son code. Catalogues 21st.dev et Aceternity consultés : aucun composant graphique importé, le vrai produit suffit. Liens des références conservés dans le rapport final.

## Design et storyboard
Thèse : une vitrine éditoriale vidéo, avec la précision d'un produit mobile. Typographie Manrope locale ; grands titres, filets, numéros de séquence ; fonds navy et accents violet, aucune grille répétitive de cartes.
Hero retenu : « Le bon Creator. La bonne campagne. » Alternatives étudiées : « Creators et marques, enfin bien connectés » (plus institutionnel) ; « Vos créations méritent les bonnes rencontres » (moins explicite pour les marques).
Parcours : intro masque 1,5 s une fois/session → hero vidéo et téléchargements → problème/bénéfices → device sticky découverte/match/campagne/collaboration → deux audiences → feed → workflow à onglets → portfolio/captures → paiement et sécurité → FAQ → grand footer AVYOR.

## Architecture des pages et budgets
/, /creators/, /brands/, /features/, /how-it-works/, /security/, /faq/, /download/, /privacy/, /terms/, /contact/, /legal/ et vraie 404. Contenu spécifique par intention ; pas de pages géographiques.
Budget initial : JS gzip < 140 Ko ; CSS gzip < 25 Ko ; poster < 220 Ko ; vidéo desktop < 3 Mo, mobile < 1,5 Mo ; dimensions explicites et polices locales. CWV terrain non disponibles ; mesurer laboratoire séparément.

## Fichiers à créer
src/config, contenu typé, composants UI et motion, pages, styles ; scripts de pré-rendu, marque, vidéo et serveur statique ; tests/seo, tests/unit, tests/e2e ; docs/site et docs/seo ; pipeline CI.
Ordre : audit et inventaire → tests RED → assets et tokens → pages et interactions → pré-rendu SEO → vérifications fonctionnelles, mobile, clavier, reduced motion, contraste et budget → rapports.

# News AVYOR — guide de l’éditeur

Tout se fait depuis l’admin locale. Le site public est pré-rendu : **publier écrit un fichier, déployer le met en ligne.**

```bash
bun run dev          # démarre le site et l’admin
# puis ouvrir http://127.0.0.1:5173/admin/
```

## Où vivent les articles

| Dossier | Contenu | Versionné | Déployé |
| --- | --- | --- | --- |
| `content/news/` | La version **publiée** de chaque article | oui | oui |
| `content/news-drafts/` | Brouillons et modifications en attente | **non** | **non** |
| `public/news/media/` | Images, nommées par leur empreinte | oui | oui |

Le dépôt GitHub est public : un brouillon commité serait lisible par tous avant sa publication. Il reste donc sur votre poste, exclu par `.gitignore` **et** par `.vercelignore`. Corollaire : un brouillon n’est ni sauvegardé ailleurs, ni partagé entre deux machines.

## Écrire un article

1. **Nouvel article** → choisissez la langue. L’article naît en brouillon.
2. Remplissez le titre, puis **Depuis le titre** pour le slug. Le slug n’est jamais recalculé tout seul : il devient une adresse publique.
3. Écrivez dans l’éditeur. Raccourcis usuels : `Ctrl/Cmd + B` gras, `Ctrl/Cmd + I` italique, `Ctrl/Cmd + K` lien, `Ctrl/Cmd + Z` annuler. Un collage depuis un traitement de texte est nettoyé : seules les mises en forme du site survivent.
4. **Enregistrer le brouillon** à volonté. Le bandeau d’alerte liste ce qui manque pour publier ; le bouton **Publier** reste inactif tant qu’il reste un point.
5. **Prévisualiser** affiche la page telle qu’elle sera lue, avec le même sommaire et les mêmes ancres. Cet aperçu n’existe que sur votre poste.

## Publier

1. **Publier** écrit `content/news/<id>.json`. L’article n’est pas encore en ligne. Depuis le terminal : `bun run news:publish` liste les brouillons, `bun run news:publish <id>` en publie un, `--all` les publie tous — même validation qu’en interface.
2. Mettez-le en ligne :

```bash
git add content/news public/news vercel.json
git commit -m "News : <titre>"
git push          # Vercel reconstruit le site
```

Le délai de mise en ligne est celui du déploiement Vercel — une à deux minutes en général, à vérifier sur le tableau de bord. Rien n’apparaît avant.

## Modifier un article déjà en ligne

Ouvrez-le, modifiez, **Enregistrer le brouillon** : la version publique ne bouge pas. L’admin affiche « Modifications en attente ». **Publier les modifications** remplace la version en ligne au déploiement suivant.

**Changer l’adresse d’un article publié** ajoute automatiquement une redirection permanente de l’ancienne vers la nouvelle dans `vercel.json`. Commitez ce fichier avec l’article. Si les deux divergent, le build refuse de démarrer ; `bun run news:redirects` les réaligne.

## Retirer un article

- **Dépublier** : l’article sort du site (404), son contenu revient en brouillon.
- **Archiver** : même effet, mais il est rangé comme archivé.

Dans les deux cas, supprimez le fichier publié et poussez :

```bash
git add -A content/news vercel.json && git commit -m "News : retrait de <titre>" && git push
```

## Ce que le site fait tout seul

À chaque build, depuis `content/news/` uniquement : les pages d’articles, la liste paginée, l’index de recherche, le flux RSS, le sitemap avec les dates de modification, les liens `hreflang` des vraies traductions, la section « Dernières publications » de l’accueil et le lien News dans la navigation. **Une langue sans article publié n’a pas de section News** : ni page, ni lien, ni entrée de sitemap.

## Commandes

```bash
bun run news:seed        # (re)crée les quatre brouillons de départ
bun run news:publish     # liste les brouillons ; <id> ou --all pour publier
bun run news:redirects   # réaligne vercel.json sur les articles publiés
bun run news:fixture     # construit le site de test (articles fictifs publiés)
bun run test             # modèle, stockage, API, articles
bun run test:seo         # HTML construit, y compris le site de test News
bun run test:e2e         # parcours public et parcours d’administration
```

## À savoir

- **L’admin n’existe qu’en développement.** Le site déployé n’a ni page d’administration ni API : un test le vérifie à chaque build.
- **Les images** sont réencodées en WebP à l’envoi, leurs métadonnées retirées, et nommées par leur empreinte. Seuls PNG, JPEG et WebP sont acceptés — jamais SVG, qui peut porter du script.
- **Une image a toujours un texte alternatif.** C’est une condition de publication.
- **Les ancres de section** sont posées à l’enregistrement. Avant la première publication elles suivent le titre ; ensuite elles ne bougent plus, même si le titre est retouché — un lien partagé continue de fonctionner.
- **Un article ne peut pas être publié** s’il contient un marqueur « à compléter », une date de publication future, une adresse déjà prise, une image absente du stockage ou un lien qui n’est pas `https:`, `mailto:`, une page du site ou une ancre.

Les choix techniques sont dans [modele-de-donnees.md](modele-de-donnees.md), le référencement dans [seo.md](seo.md), la ligne éditoriale dans [ligne-editoriale.md](ligne-editoriale.md).

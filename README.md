# SNX Studio — V7 Collections

Extraire tout le ZIP puis ouvrir index.html. Le site fonctionne sans installation ni compte.

Parcours : Entrer → Collections → Studio → Obtenir le pack (panneau latéral).

Les neuf thèmes occupent une seule galerie : cartes compactes, quatre colonnes sur grand écran, trois sur écran intermédiaire et deux sur mobile. Défilement vertical, images de collection entières.

## Utilisation

- Fonds : toucher une miniature pour l’appliquer au téléphone.
- Icônes : sélectionner un emplacement sur le téléphone, puis une icône du catalogue pour l’agrandir. « Appliquer au téléphone » confirme le choix. Fermer ou Échap laisse la composition inchangée.
- Widgets : toucher un élément pour l’essayer ; toucher à nouveau pour le retirer.
- Le panneau d’achat reste une démonstration, sans paiement ni livraison.

| Thème | Icônes | Fonds | Widgets à essayer |
|---|---:|---:|---|
| GalaxyP | 78 | 2 | 1 horloge web |
| Inferno Storm | 90 | 16 | 3 visuels fixes |
| Stranger Vibes | 72 | 8 | 4 visuels fixes |
| GoldToon | 79 | 2 | 1 horloge web |
| Liquid Glass | 77 | 16 | 1 horloge web |
| Quiet Comfort | 77 | 1 | 1 horloge web |
| Aurora | 53 | 8 | 1 horloge web |
| Liquigv2 | 58 | 3 | 1 horloge web |
| MouseToon | 78 | 1 | 1 horloge web |

Les icônes de chaque thème restent séparées. GalaxyP reprend le Galaxy existant, dont les 78 icônes sont identiques ; aucun second pack artificiel n’est créé. Aurora n’est importé qu’une fois.

Sept horloges ont été créées en HTML/CSS pour les thèmes qui n’avaient pas de widget. Elles affichent l’heure et la date de l’appareil dans le site. Ce ne sont pas des fichiers natifs installables sur iOS/Android. Les sept autres aperçus sont des images fournies ou extraites de captures : leur heure et leur météo sont fixes.

## Nouveautés

- **Pour moi** : un onglet dans l'en-tête ouvre une page où vous créez vos propres thèmes (nom, couleurs, fonds et icônes importés depuis votre appareil). Ils apparaissent ensuite dans Collections avec un badge « Personnel » et se personnalisent dans le Studio comme les thèmes fournis. Ils sont stockés dans le navigateur (localStorage) : ils ne sont visibles que sur cet appareil et ce navigateur.
- **Rotation des fonds** : l'étoile ★ sur un fond l'ajoute à un diaporama ; le bouton sous le téléphone lance une rotation automatique (toutes les 4 s) entre les fonds marqués.
- **Tailles de widget** : quand un widget est actif, un sélecteur Small / Medium / Large apparaît pour changer sa taille d'aperçu.
- **Zoom sur icône** : cliquer une icône du téléphone (pas seulement du panneau) l'affiche en grand.
- Fond de page cohérent avec l'accueil sur Collections, Studio et Pour moi, teinté selon le thème ouvert.

## Ajouter un thème

Compléter src/data/packs.js : id, name, colors, cover, wallpapers, icons, widgets, defaultIcons. Chaque defaultIcons doit appartenir au thème. Puis exécuter python3 scripts/build.py. Une seule vue Studio sert toutes les collections.

Widgets : kind « web-clock » pour l’horloge HTML/CSS ; « static-preview » pour une image. Le composant src/components/widget.js affiche l’élément adapté. Formats small, medium, large.

## Vérification

npm install, npm test, npm run test:browser et npm run test:features. Chromium doit être installé ; SNX_CHROMIUM_PATH peut désigner un exécutable local. Le fichier app.bundle.js livré est déjà construit.

Voir ANALYSE_DES_PACKS.md pour les regroupements et VALIDATION.md pour les essais.

# Architecture conservée et étendue

SPA autonome avec trois vues : Accueil, Collections, Studio. `src/data/packs.js` décrit les ressources et `src/data/catalog.js` expose le catalogue canonique. Aucun moteur spécifique par thème.

Le routeur hash gère le parcours et les anciennes URL. L’achat utilise une entrée d’historique à hash inchangé et un dialogue natif, avec repli accessible. Les contrôleurs AbortController libèrent les écouteurs lors du changement de vue.

Le store `snx.studio.v5` normalise les fonds, les douze emplacements d’icônes, le widget éventuel et l’emplacement sélectionné. Chaque thème a ses propres préférences. La V4 utilise une autre clé et reste indépendante.

Le Studio utilise une grille responsive. ResizeObserver ajuste l’échelle du téléphone à l’espace disponible, sans modifier son ratio. Les catégories sont des onglets accessibles ; le choix courant s’affiche dans un panneau interne défilant. Les images de listes sont des miniatures, les fonds du téléphone sont les versions pleine définition.

Le téléphone possède une image de fond HTML, ce qui permet de vérifier son chargement directement. L’image remplit l’écran par recadrage central proportionnel. Les cartes Collections et les miniatures utilisent `object-fit: contain`, sans recadrage ni étirement.

Le build Python assemble douze modules ES dans un bundle autonome utilisable en ouverture locale. Aucune bibliothèque ou police distante n’est nécessaire à l’exécution.

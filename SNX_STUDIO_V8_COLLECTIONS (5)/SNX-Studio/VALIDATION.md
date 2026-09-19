# Validation V7

7 contrôles statiques réussis ; 60 contrôles DOM réussis ; 295 contrôles Chromium réussis sans erreur de script, ressource manquante ni nouvelle fenêtre inattendue.

Sept tailles : 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844, 320×740. Neuf thèmes testés : tous les fonds appliqués, sélection des icônes avec aperçu agrandi, application au bon emplacement, persistance, widgets ajoutés et retirés, téléphone entièrement visible, panneau d’achat et navigation historique.

Essais spécifiques à 1440, 390 et 320 pixels : aperçu agrandi sans application automatique, fermeture Échap sans quitter le Studio, restitution du focus, horloge web qui actualise l’heure après changement contrôlé de la date, neuf cartes de hauteur identique. Voir docs/features-results.json.

Les captures de collections, zoom mobile, widgets GalaxyP/MouseToon/Aurora et Studio Liquigv2 ont été inspectées visuellement. Une sélection de captures est incluse ; la suite navigateur peut régénérer l’ensemble. Les résultats complets sont dans docs/browser-results/results.json.

Huit fichiers WebP vides détectés lors de la première validation ont été réencodés à partir de leur source ; tous les contrôles de ressources ont ensuite réussi. Aucun original modifié.

Ces essais ne constituent pas une validation de paiement ni d’installation de widgets natifs.

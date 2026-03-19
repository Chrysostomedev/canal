# directive.md

## Règles absolues

1. **Examine d'abord l'existant** — lis tous les fichiers du projet front avant de toucher quoi que ce soit.
2. **Ne touche pas à l'UI** — aucun composant, aucun style, aucun layout ne doit être modifié.
3. **Ne réinvente pas la stack** — utilise exactement ce qui est déjà installé et en place.

---

## Ta mission

Le backend Laravel tourne en local dans le dossier app.canal.back . Tu dois connecter le front Next à ce backend.

- Examine le code front existant pour comprendre comment il est structuré.
- Examine les routes et contrôleurs Laravel pour comprendre ce que le backend expose.
- Ajoute uniquement la logique nécessaire pour que le front communique avec le back.
- Ne modifie rien d'autre.

---

## Ce que tu peux faire

- Créer ou compléter des fichiers de service / appels API s'ils n'existent pas encore.
- Brancher les données réelles du backend (le dossier app-canal-back) là où le front affiche des données statiques ou pas bien implémentés et non fonctionnel.
- Gérer les erreurs retournées par l'API.

## Ce que tu ne dois jamais faire

- Modifier un composant UI ou son style.
- Changer la structure des fichiers existants.
- Installer de nouvelles dépendances sans demander.
- Inventer des routes backend — base-toi uniquement sur ce que le Laravel expose réellement.
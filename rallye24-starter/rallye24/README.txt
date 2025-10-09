
# Rallye24 — Starter (Vercel + Supabase)

Deux applis PWA :

- `apps/admin` — interface organisateur
- `apps/team` — interface équipes

## Prérequis
- Compte Supabase créé, avec tables (script SQL fourni précédemment)
- Variables d'environnement déjà ajoutées dans Vercel :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Installation locale (optionnel)
1. Installe Node.js LTS
2. Dans `apps/admin` puis `apps/team` :
   ```bash
   npm install
   npm run dev
   ```

## Déploiement sur Vercel
1. Crée un dépôt GitHub `rallye24`
2. Ajoute le contenu de ce dossier au dépôt et pousse
3. Sur Vercel → Import Project → sélectionne `rallye24`
4. Build & Deploy auto

## Connexion
- Crée un utilisateur **admin** dans Supabase → Authentication → Users
- Mets son `role='admin'` dans la table `public.profiles`

## Vérification rapide
- `admin` : se connecter → bouton "Charger les scores" (lit la vue `scores`)
- `team` : créer un compte → bouton "Charger 5 énigmes" (lit `riddles`)

Ce starter est minimal. Tu pourras ensuite ajouter écrans, offline, photos, etc.

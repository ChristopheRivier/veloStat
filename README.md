# Vélo Stats

Application minimaliste pour enregistrer ses trajets à vélo et consulter des statistiques de distance. Stack : **Next.js** + **Supabase** (auth + base de données), déployable gratuitement sur **Vercel**.

## Fonctionnalités

- **Inscription / Connexion** (email + mot de passe, confirmation par email)
- **Trajets** : ajout (date, distance km, durée, note), liste, suppression
- **Statistiques** : distance totale, nombre de trajets, distance du mois, temps total, distance par mois

## Prérequis

- Node.js 18.17+ (ou 20+ recommandé si `npm install` échoue)
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit) pour le déploiement

## Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un projet.
2. Dans **Project Settings > API** : copiez l’**Project URL** et la clé **anon public**.
3. Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
```

### 3. Créer la table et les politiques RLS

Dans le dashboard Supabase, ouvrez **SQL Editor** et exécutez le contenu du fichier `supabase/schema.sql`.

### 4. (Optionnel) Configurer l’email de confirmation

Par défaut, Supabase envoie un email de confirmation à l’inscription. En développement, vous pouvez désactiver la confirmation dans **Authentication > Providers > Email** (désactiver "Confirm email").

L’URL de redirection après confirmation doit être :  
`https://VOTRE_DOMAINE/auth/callback`  
(en local : `http://localhost:3000/auth/callback`).  
À configurer dans **Authentication > URL Configuration > Redirect URLs** si besoin.

### 5. Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Déploiement sur Vercel

1. Poussez le code sur GitHub (ou autre dépôt connecté à Vercel).
2. Sur [vercel.com](https://vercel.com), **New Project** et importez le dépôt.
3. Ajoutez les variables d’environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Déployez.

Dans Supabase, ajoutez l’URL de production (ex. `https://votre-app.vercel.app`) dans **Authentication > URL Configuration > Site URL** et **Redirect URLs** (`https://votre-app.vercel.app/auth/callback`).

## Structure

- `src/app/` : pages (App Router) — accueil, login, signup, dashboard, stats, callback auth
- `src/components/` : Nav, formulaire d’ajout de trajet, liste des trajets
- `src/lib/supabase/` : clients Supabase (navigateur et serveur)
- `supabase/schema.sql` : table `rides` + RLS

## Coûts

- **Supabase** : free tier (500 Mo DB, 50k utilisateurs actifs/mois) suffisant pour démarrer.
- **Vercel** : free tier adapté aux petits projets.
- Aucun serveur à gérer, facturation à l’usage au-delà des seuils gratuits.

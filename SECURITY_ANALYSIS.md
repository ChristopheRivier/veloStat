# Analyse de sécurité — Vélo Stats

Application **Next.js 14** + **Supabase** (auth, base PostgreSQL avec RLS). Analyse réalisée sur le code source, le schéma SQL, le middleware et les dépendances.

---

## 1. Points positifs

### 1.1 Authentification et autorisation
- **Supabase Auth** : gestion centralisée (email/mot de passe, confirmation email).
- **Middleware** : redirection vers `/login` pour les routes protégées si pas de session ; redirection des utilisateurs connectés depuis `/login` et `/signup` vers `/stats`.
- **Vérification côté serveur** : les pages protégées (`dashboard`, `bikes`, `stats`) appellent `supabase.auth.getUser()` et font `redirect("/login")` si pas d’utilisateur — double contrôle avec le middleware.

### 1.2 Données et RLS (Row Level Security)
- **RLS activé** sur `bikes` et `rides` avec des politiques explicites :
  - `auth.uid() = user_id` pour SELECT, INSERT, UPDATE, DELETE.
- Chaque utilisateur ne peut accéder qu’à ses propres enregistrements ; les opérations CRUD côté client passent par le client Supabase qui envoie le JWT, et Supabase applique les politiques.

### 1.3 Schéma et intégrité
- Clés étrangères : `user_id` → `auth.users`, `bike_id` → `bikes`, avec `ON DELETE CASCADE` / `SET NULL` cohérents.
- Contraintes : `distance_km >= 0`, `duration_minutes >= 0` sur `rides`.
- Pas d’exposition de clés secrètes côté client : seule la clé **anon** (publique) et l’URL Supabase sont utilisées, ce qui est normal avec RLS.

### 1.4 Environnement
- `.gitignore` contient `.env` et `.env*.local` — les secrets ne doivent pas être versionnés.

### 1.5 XSS
- React échappe le contenu par défaut ; les champs utilisateur (note, nom de vélo, etc.) sont affichés en texte, pas en `dangerouslySetInnerHTML`.

---

## 2. Vulnérabilités et risques

### 2.1 Critique : Redirection ouverte (Open Redirect) — callback auth

**Fichier :** `src/app/auth/callback/route.ts`

```ts
const next = searchParams.get("next") ?? "/stats";
// ...
return NextResponse.redirect(`${origin}${next}`);
```

Le paramètre `next` n’est pas validé. Un attaquant peut envoyer un lien du type :

`https://votre-app.com/auth/callback?code=...&next=//evil.com/phishing`

Après échange du code, l’utilisateur est redirigé vers `https://votre-app.com//evil.com/phishing` (navigation relative) ou, selon l’interprétation du navigateur, vers un domaine externe. Cela peut servir au phishing ou à l’exfiltration de tokens si le client suit des redirections non contrôlées.

**Recommandation :** N’accepter que des chemins internes (whitelist). Par exemple :

```ts
const next = searchParams.get("next") ?? "/stats";
const allowedPaths = ["/", "/stats", "/dashboard", "/bikes", "/login"];
const path = next.startsWith("/") ? next : `/${next}`;
const safeNext = allowedPaths.some((p) => path === p || path.startsWith(p + "/")) ? path : "/stats";
return NextResponse.redirect(`${origin}${safeNext}`);
```

(À adapter selon vos routes exactes.)

---

### 2.2 Critique : Dépendance Next.js vulnérable

**npm audit** signale une vulnérabilité **critique** sur **Next.js** (dont **Authorization Bypass in Next.js Middleware**, GHSA-f82v-jwr5-mffw) pour la plage `>=14.0.0 <14.2.25`. La version utilisée est **14.2.18**, donc concernée.

Autres failles signalées sur Next : DoS (Server Actions, Server Components), cache poisoning, SSRF via middleware, etc.

**Recommandation :** Mettre à jour Next.js vers une version corrigée (ex. **14.2.35** ou supérieur, selon les avis de sécurité) :

```bash
npm install next@14.2.35
```

Puis relancer `npm audit` et traiter les autres alertes (ESLint, etc.) selon la politique de mise à jour (éventuellement `npm audit fix` sans `--force` en premier).

---

### 2.3 Mots de passe : politique côté client limitée

- **Signup** : `minLength={6}` en HTML uniquement. Supabase impose aussi un minimum (par défaut 6 caractères).
- Pas de règles affichées (majuscule, chiffre, symbole), ce qui peut donner des mots de passe faibles.

**Recommandation :** Renforcer la politique côté Supabase (Dashboard → Authentication → Settings) et, si besoin, afficher des critères côté client (longueur, complexité) pour guider l’utilisateur.

---

### 2.4 Validation des entrées et limites

- **AddRideForm / EditRideForm** : la distance est parsée et vérifiée (`>= 0`), la durée en minutes peut être `parseInt(..., 10)` → risque de `NaN` si chaîne invalide (envoyé comme `null` dans le code actuel, ce qui est acceptable avec le schéma).
- **Note / nom / marque** : pas de limite de longueur côté app ; la base peut avoir des limites (types `text`). Des chaînes très longues pourraient être abusées (DoS léger, stockage).

**Recommandation :**  
- Vérifier que `duration_minutes` ne soit pas `NaN` avant l’insert/update (ou bien forcer `null` explicitement).  
- Limiter la longueur des champs texte côté client (et éventuellement en contraintes SQL) pour éviter abus et incohérences.

---

### 2.5 Paramètre de requête `bike` (stats)

**Fichier :** `src/app/stats/page.tsx`

`bikeId` provient de `searchParams.bike`. Les trajets sont déjà filtrés par RLS (uniquement les trajets de l’utilisateur). Le filtrage par `bike_id` se fait en mémoire sur ces données, donc un `bike` arbitraire ne donne pas accès à des données d’un autre utilisateur.

**Risque restant :** Un UUID invalide ou un UUID d’un autre utilisateur ne fait que donner des stats vides. Pour une meilleure robustesse et une UX claire, on peut valider que `bikeId` appartient à la liste des vélos de l’utilisateur et ignorer/sanitiser sinon.

---

### 2.6 En-têtes de sécurité HTTP

**Fichier :** `next.config.mjs`

Aucun en-tête de sécurité (CSP, HSTS, X-Frame-Options, etc.) n’est configuré.

**Recommandation :** Ajouter des en-têtes dans `next.config.mjs` :

```js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

CSP (Content-Security-Policy) peut être ajoutée progressivement en fonction des scripts et styles utilisés (Next, Supabase, etc.).

---

### 2.7 Auth callback et erreur

En cas d’erreur lors de `exchangeCodeForSession`, l’utilisateur est redirigé vers `/login?error=auth` sans log côté serveur. Pour le diagnostic d’incidents (tentatives d’abus, problèmes Supabase), un log structuré (sans données sensibles) peut aider.

---

## 3. Synthèse des actions prioritaires

| Priorité | Action |
|----------|--------|
| **P0** | Corriger l’open redirect dans `/auth/callback` (whitelist du paramètre `next`). |
| **P0** | Mettre à jour Next.js vers 14.2.35 (ou version patchée indiquée par les avis). |
| **P1** | Ajouter des en-têtes de sécurité (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.). |
| **P1** | Exécuter `npm audit` et appliquer les correctifs (notamment Next, puis ESLint si possible sans casser le projet). |
| **P2** | Renforcer la politique de mot de passe (Supabase + indication côté client). |
| **P2** | Valider/expliciter la gestion de `duration_minutes` (éviter NaN) et définir des limites de longueur pour les champs texte. |
| **P2** | (Optionnel) Valider le paramètre `bike` sur la page stats par rapport aux vélos de l’utilisateur. |

---

## 4. Dépendances (résumé npm audit)

- **Next.js** : 1 vulnérabilité critique (bypass middleware) + plusieurs high/moderate (DoS, cache, SSRF, etc.) — **mise à jour urgente**.
- **ESLint / eslint-config-next** : vulnérabilités (minimatch ReDoS, glob, etc.) — principalement en dev ; à corriger quand possible (mises à jour majeures possibles).

Commande utile après mise à jour :

```bash
npm audit
npm audit fix
```

---

*Rapport généré à partir du code et de l’état des dépendances du projet. Revoir après chaque changement de stack ou de schéma.*

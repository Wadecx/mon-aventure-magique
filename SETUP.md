# Guide de configuration

## 1. Installation des dépendances

```bash
npm install --legacy-peer-deps
```

## 2. Configuration de la base de données PostgreSQL

### Option A : Utiliser une base de données locale

1. Installer PostgreSQL sur votre machine
2. Créer une base de données :

```sql
CREATE DATABASE saas_video;
```

3. Mettre à jour le fichier `.env` avec l'URL de connexion :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_video"
```

### Option B : Utiliser Vercel Postgres ou Supabase (recommandé pour la prod)

1. Créer un projet sur [Vercel](https://vercel.com) ou [Supabase](https://supabase.com)
2. Copier l'URL de connexion PostgreSQL
3. Mettre à jour le fichier `.env`

## 3. Générer le client Prisma et migrer la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer la migration initiale
npx prisma migrate dev --name init

# Ou pousser le schéma sans migration (pour le développement)
npx prisma db push
```

## 4. Configuration des variables d'environnement

Assurez-vous que votre fichier `.env` contient :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/saas_video"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="votre-secret-genere"

# API Revid
REVID_API_KEY="votre-cle-api-revid"
REVID_WEBHOOK_SECRET="votre-secret-webhook"
```

## 5. Créer un utilisateur de test

Créez un script pour créer un utilisateur de test ou utilisez le formulaire d'inscription.

## 6. Lancer l'application

```bash
npm run dev
```

## 7. Tester le flux complet

1. Se connecter avec votre utilisateur
2. Aller sur `/dashboard/projects/new`
3. Créer un projet avec une image et un prompt
4. Le projet est créé en BDD avec status "pending"
5. L'API Revid est appelée et retourne un `jobId`
6. Le projet passe en status "processing" avec le `jobId`
7. Quand Revid termine, il envoie un webhook à `/api/webhooks/revid`
8. Le webhook met à jour le projet en "completed" et crée une entrée Video
9. La vidéo apparaît dans `/dashboard/videos` (uniquement pour l'utilisateur propriétaire)

## Sécurité

- Seul l'utilisateur authentifié peut voir ses propres vidéos
- L'API `/api/videos` filtre par `userId`
- Le webhook vérifie que le `projectId` existe avant de créer la vidéo
- Chaque vidéo est liée à un projet, qui est lié à un utilisateur

## Notes importantes

- Le webhook Revid doit être accessible publiquement en production (utilisez ngrok pour le développement local)
- Pour le développement local avec webhook, utilisez : `ngrok http 3000`
- Mettez à jour `NEXTAUTH_URL` avec l'URL ngrok pour que Revid puisse envoyer le webhook

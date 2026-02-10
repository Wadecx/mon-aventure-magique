# Claude.md — Instructions Projet SaaS Vidéo

## 🎯 Objectif du projet

Créer un **SaaS web** permettant à un utilisateur authentifié de :

1. Créer un compte / se connecter
2. Accéder à un **dashboard**
3. Créer un **projet vidéo** à partir d’un formulaire (nom, prénom, image, prompt utilisateur)
4. Envoyer ces données à une **API externe (Revid)** pour générer une vidéo
5. Consulter un **onglet Vidéos** pour récupérer la vidéo une fois la génération terminée

Le projet doit être **scalable, sécurisé et maintenable**.

---

## 🧱 Stack technique imposée

### Frontend

* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS**
* **React Server Components + Client Components quand nécessaire**

### Backend

* API Routes Next.js (route handlers)
* Intégration API externe **Revid** (POST génération vidéo, GET statut/résultat)

### Base de données

* PostgreSQL (ou équivalent SQL)
* ORM recommandé : **Prisma**

### Authentification

* Auth par email + mot de passe
* Outil recommandé : **NextAuth/Auth.js**
* Sessions sécurisées (JWT ou database sessions)

---

## 🔐 Authentification & Autorisation

### Pages publiques

* `/login`
* `/register`

### Pages protégées (auth requise)

* `/dashboard`
* `/dashboard/projects`
* `/dashboard/videos`

### Règles

* Un utilisateur ne peut accéder qu’à **ses propres projets et vidéos**
* Redirection automatique vers `/login` si non authentifié

---

## 📊 Modèles de données (schéma logique)

### User

* id
* email
* passwordHash
* createdAt

### Project

* id
* userId
* firstName
* lastName
* imageUrl
* prompt
* status (`pending | processing | completed | failed`)
* revidJobId
* createdAt

### Video

* id
* projectId
* videoUrl
* thumbnailUrl (optionnel)
* duration (optionnel)
* createdAt

---

## 🧭 Architecture des pages

### Auth

* `app/(auth)/login/page.tsx`
* `app/(auth)/register/page.tsx`

### Dashboard

* `app/dashboard/layout.tsx`
* `app/dashboard/page.tsx` (overview)

### Projets

* `app/dashboard/projects/page.tsx` → liste des projets
* `app/dashboard/projects/new/page.tsx` → création projet

### Vidéos

* `app/dashboard/videos/page.tsx`
* Affiche uniquement les vidéos **terminées**

---

## 📝 Création de projet (fonctionnement détaillé)

### Formulaire

Champs requis :

* Nom
* Prénom
* Upload image (ou URL)
* Prompt texte (instruction utilisateur)

### Workflow

1. Validation frontend
2. Sauvegarde projet en BDD (`status = pending`)
3. Appel API interne `/api/revid/create`
4. POST vers API Revid avec :

   * nom
   * prénom
   * image
   * prompt
5. Sauvegarde du `revidJobId`
6. Passage du projet en `processing`

---

## 🎥 Génération & récupération vidéo

### Polling / Webhook (au choix)

#### Option 1 — Polling

* Cron ou tâche server
* GET `/api/revid/status?jobId=xxx`
* Si terminé →

  * Récupérer URL vidéo
  * Créer entrée `Video`
  * Mettre projet en `completed`

#### Option 2 — Webhook (si Revid le permet)

* Endpoint `/api/webhooks/revid`
* Vérification signature
* Mise à jour BDD

---

## 🧩 API Routes internes

* `POST /api/auth/register`
* `POST /api/projects`
* `GET /api/projects`
* `POST /api/revid/create`
* `GET /api/revid/status`
* `POST /api/webhooks/revid`

---

## 🎨 UI / UX

* Dashboard clair et minimal
* États visibles : loading, error, success
* Badge de statut projet (pending / processing / completed)
* Skeleton loaders
* Responsive mobile / desktop

---

## ⚠️ Contraintes importantes

* Toujours typer les données (TypeScript strict)
* Aucune clé API exposée côté client
* Variables sensibles dans `.env`
* Gestion propre des erreurs API
* Code modulaire et lisible

---

## 🚀 Bonnes pratiques attendues

* Components réutilisables
* Hooks personnalisés si nécessaire
* Server Actions si pertinent
* Séparation claire frontend / backend
* Commits clairs et atomiques

---

## ✅ Résultat attendu

Un SaaS fonctionnel permettant :

* Authentification utilisateur
* Création de projets vidéo
* Envoi à l’API Revid
* Récupération et affichage des vidéos générées

Le projet doit être prêt pour une **mise en production**.

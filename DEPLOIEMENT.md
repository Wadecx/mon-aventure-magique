# Guide de Déploiement en Production

## 📋 Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Base de données Neon déjà configurée
- Clé API Revid

## 🚀 Étapes de Déploiement

### 1. Pousser le code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit - SaaS Video Generation"
git remote add origin https://github.com/VOTRE-USERNAME/votre-repo.git
git branch -M main
git push -u origin main
```

### 2. Déployer sur Vercel

**Option A - Interface Web (Recommandé):**

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "Import Project"
4. Sélectionnez votre repository GitHub
5. Configurez les variables d'environnement (voir ci-dessous)
6. Cliquez "Deploy"

**Option B - CLI:**

```bash
# Installer Vercel CLI globalement
pnpm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel
```

### 3. Variables d'Environnement sur Vercel

Dans les paramètres de votre projet Vercel, ajoutez ces variables:

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Votre URL Neon PostgreSQL (déjà configurée) |
| `NEXTAUTH_URL` | URL de votre app Vercel (ex: `https://mon-app.vercel.app`) |
| `AUTH_SECRET` | Générer avec: `openssl rand -base64 32` |
| `REVID_API_KEY` | Votre clé API Revid existante |

### 4. Après le Déploiement

1. **Copier l'URL de production** fournie par Vercel (ex: `https://mon-app.vercel.app`)

2. **Mettre à jour NEXTAUTH_URL** dans les variables d'environnement Vercel avec cette URL

3. **Configurer le webhook Revid:**
   - Allez dans votre compte Revid
   - Configurez l'URL du webhook: `https://mon-app.vercel.app/api/webhooks/revid`

4. **Redéployer** pour prendre en compte les changements

## 🔒 Sécurité

- ✅ `.env` est dans `.gitignore` (vos secrets ne seront pas poussés)
- ✅ Toutes les clés sensibles sont des variables d'environnement
- ✅ Base de données Neon avec SSL activé

## 🎯 Domaine Personnalisé (Optionnel)

1. Acheter un domaine (ex: sur Namecheap, OVH, etc.)
2. Dans Vercel, aller dans Project Settings > Domains
3. Ajouter votre domaine personnalisé
4. Configurer les DNS selon les instructions Vercel
5. Mettre à jour `NEXTAUTH_URL` avec votre nouveau domaine

## ✅ Vérifications Post-Déploiement

- [ ] L'app se charge correctement
- [ ] La connexion utilisateur fonctionne
- [ ] La création de projets fonctionne
- [ ] Les webhooks Revid sont reçus
- [ ] Les vidéos s'affichent dans le dashboard

## 🐛 Troubleshooting

### "Database connection error"
- Vérifiez que `DATABASE_URL` est correctement configurée
- Assurez-vous que Neon autorise les connexions depuis Vercel

### "NextAuth error"
- Vérifiez que `AUTH_SECRET` est définie
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL de production

### "Webhook non reçu"
- Vérifiez l'URL du webhook dans votre compte Revid
- Testez avec: `curl -X POST https://votre-app.vercel.app/api/webhooks/revid`

## 📊 Monitoring

Vercel fournit automatiquement:
- Logs en temps réel
- Analytics
- Monitoring des performances
- Notifications d'erreurs

Accédez-y depuis votre dashboard Vercel.

## 🔄 Mises à Jour

Pour déployer une nouvelle version:

```bash
git add .
git commit -m "Description des changements"
git push
```

Vercel redéploiera automatiquement à chaque push sur `main`.

# XOXO.TRAVEL — GitHub & Deployment Guide

_Step-by-step guide to push to a private GitHub repository and deploy to Vercel + Railway/Render + MongoDB Atlas._

**No automatic deployment** — complete each section by logging into the respective platforms.

---

## Table of contents

1. [Repository preparation](#1-repository-preparation)
2. [Push to GitHub](#2-push-to-github)
3. [MongoDB Atlas setup](#3-mongodb-atlas-setup)
4. [Backend deployment (Railway)](#4-backend-deployment-railway)
5. [Backend deployment (Render)](#5-backend-deployment-render-alternative)
6. [Frontend deployment (Vercel)](#6-frontend-deployment-vercel)
7. [Environment variables reference](#7-environment-variables-reference)
8. [Domain connection (later)](#8-domain-connection-later)
9. [Production checklist](#9-production-checklist)
10. [Verification commands](#10-verification-commands)

---

## 1. Repository preparation

Before pushing, confirm locally:

```bash
# From repository root
npm run build                    # Frontend — must pass
cd backend && npm run qa         # Backend — 58/58 (API must be running)
```

**Never commit:**

- `.env`, `.env.local`, `backend/.env`
- `node_modules/`, `.next/`
- `backend/uploads/`, `backend/invoices/`

**Templates to commit:**

- `.env.example` (frontend)
- `backend/.env.example` (local dev)
- `backend/.env.production.example` (production reference)

Generate JWT secrets:

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # REFRESH_TOKEN_SECRET
```

---

## 2. Push to GitHub

### Create private repository

1. Log in to [GitHub](https://github.com).
2. **New repository** → Name: `xoxo-travels` (or your choice).
3. Visibility: **Private**.
4. Do **not** initialize with README (this repo already has one).

### Initialize and push (first time)

From your project root (`xoxo-travels/`):

```bash
git init
git add .
git status                        # Verify no .env files staged
git commit -m "Initial commit — XOXO.TRAVEL platform"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/xoxo-travels.git
git push -u origin main
```

### Verify nothing sensitive was committed

```bash
git log --oneline -1
git show --name-only | grep -E '\.env$|\.env\.local'
# Should return nothing
```

If `.env` was accidentally committed:

```bash
git rm --cached .env .env.local backend/.env
echo ".env" >> .gitignore
git commit -m "Remove env files from tracking"
# Rotate all secrets that were exposed
```

### Ongoing workflow

```bash
git checkout -b feature/my-change
# ... make changes ...
git add .
git commit -m "Describe your change"
git push -u origin feature/my-change
# Open Pull Request on GitHub → merge to main
```

---

## 3. MongoDB Atlas setup

### Create cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. **Build a Database** → **M0 Free** or **M10+** for production.
3. Region: **Mumbai (`ap-south-1`)** recommended for Indian users.
4. Cluster name: `xoxo-travels-cluster`.

### Database user

1. **Database Access** → **Add New Database User**.
2. Authentication: Password.
3. Privileges: **Read and write to any database** (or scoped to `xoxo-travels`).
4. Save username and password securely.

### Network access

1. **Network Access** → **Add IP Address**.
2. During setup: **Allow Access from Anywhere** (`0.0.0.0/0`) temporarily.
3. After backend is deployed: restrict to Railway/Render outbound IP.

### Connection string

1. **Database** → **Connect** → **Drivers** → Node.js.
2. Copy connection string:

```
mongodb+srv://<USER>:<PASSWORD>@xoxo-travels-cluster.xxxxx.mongodb.net/xoxo-travels?retryWrites=true&w=majority
```

Replace `<USER>`, `<PASSWORD>`, and cluster hostname. Database name: **`xoxo-travels`**.

### Seed production database

Run once from your machine (or Railway shell):

```bash
cd backend
MONGODB_URI="mongodb+srv://..." npm run seed
```

Creates destinations, packages, demo users. **Change demo passwords before public launch.**

### Enable backups

**Atlas** → **Backup** → Enable **Cloud Backup** (M10+ clusters) or export snapshots on free tier before major releases.

---

## 4. Backend deployment (Railway)

### Create project

1. Log in to [Railway](https://railway.app).
2. **New Project** → **Deploy from GitHub repo**.
3. Select your private `xoxo-travels` repository.
4. **Settings** → **Root Directory**: `backend`
5. Railway detects `backend/Dockerfile` and `backend/railway.toml`.

### Environment variables

In Railway → **Variables**, set all values from [Section 7](#7-environment-variables-reference) (backend table).

**Minimum required to boot:**

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | 64-char hex |
| `REFRESH_TOKEN_SECRET` | 64-char hex |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `TRUST_PROXY` | `true` |

### Deploy

Railway builds from `backend/Dockerfile` and deploys automatically on push to `main`.

### Get API URL

After deploy: **Settings** → **Networking** → **Generate Domain**.

Example: `https://xoxo-api-production.up.railway.app`

Health check: `https://YOUR-API-URL/api/health`

### Run smoke tests against deployed API

```bash
cd backend
API_URL=https://YOUR-API-URL npm run qa
```

---

## 5. Backend deployment (Render alternative)

Use Render if you prefer it over Railway.

### Create web service

1. Log in to [Render](https://render.com).
2. **New** → **Blueprint** → Connect GitHub repo.
3. Render reads `backend/render.yaml`.
4. Or manually: **New Web Service** → Docker → Root directory: `backend`.

### Environment variables

Set the same backend variables as Railway (Section 7) in **Environment** tab.

### Deploy

Render builds from `backend/Dockerfile`. Health check: `/api/health`.

Example URL: `https://xoxo-travels-api.onrender.com`

---

## 6. Frontend deployment (Vercel)

### Import project

1. Log in to [Vercel](https://vercel.com).
2. **Add New** → **Project** → Import GitHub repository.
3. Framework: **Next.js** (auto-detected).
4. Root directory: `/` (repository root, not `backend`).
5. `vercel.json` sets region to `bom1` (Mumbai).

### Environment variables

In Vercel → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API-URL/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://YOUR-API-URL` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-VERCEL-URL.vercel.app` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay live/test key (when ready) |

Apply to **Production**, **Preview**, and **Development**.

### Deploy

Click **Deploy**. Vercel runs `npm run build` automatically.

### Update backend CORS

After Vercel deploy, update Railway/Render backend variables:

```
CLIENT_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Redeploy backend (or restart) for CORS to take effect.

### Redeploy frontend after API URL is known

If you deployed frontend before backend URL was final, update `NEXT_PUBLIC_API_URL` and redeploy.

---

## 7. Environment variables reference

### Frontend (Vercel / `.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base, e.g. `https://api.example.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.io origin, e.g. `https://api.example.com` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public site URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | No | Razorpay checkout (demo works without) |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | No | Client-side maps (server proxy available) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Optional; middleware skips if empty |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Optional |

### Backend (Railway / Render / `backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `5000` |
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_SECRET` | Yes | ≥ 32 chars |
| `REFRESH_TOKEN_SECRET` | Yes | ≥ 32 chars |
| `CLIENT_URL` | Yes | Vercel frontend URL |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `TRUST_PROXY` | Yes | `true` behind PaaS |
| `AMADEUS_API_KEY` | No | Live flights/hotels (mock fallback) |
| `AMADEUS_API_SECRET` | No | |
| `AMADEUS_ENV` | No | `test` or `production` |
| `GOOGLE_MAPS_API_KEY` | No | Places/geocode proxy |
| `ANTHROPIC_API_KEY` | No | AI Concierge / planner |
| `RAZORPAY_KEY_ID` | No | Payments |
| `RAZORPAY_KEY_SECRET` | No | |
| `RAZORPAY_WEBHOOK_SECRET` | No | Webhook verification |
| `RESEND_API_KEY` | No | Transactional email |
| `CLOUDINARY_CLOUD_NAME` | No | Image uploads |
| `CLOUDINARY_API_KEY` | No | |
| `CLOUDINARY_API_SECRET` | No | |
| `LOG_LEVEL` | No | `info` in production |

Full template: `backend/.env.production.example`

---

## 8. Domain connection (later)

When custom domain `xoxo.travel` is ready:

### Vercel (frontend)

1. **Settings** → **Domains** → Add `xoxo.travel` and `www.xoxo.travel`.
2. Add DNS records Vercel provides (A/CNAME).
3. Update env vars:
   ```
   NEXT_PUBLIC_APP_URL=https://xoxo.travel
   ```

### Railway/Render (backend)

1. Add custom domain `api.xoxo.travel`.
2. Update env vars:
   ```
   CLIENT_URL=https://xoxo.travel
   ALLOWED_ORIGINS=https://xoxo.travel,https://www.xoxo.travel
   ```
3. Update Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://api.xoxo.travel/api
   NEXT_PUBLIC_SOCKET_URL=https://api.xoxo.travel
   ```

### SSL

Vercel and Railway/Render provision SSL automatically.

---

## 9. Production checklist

### Security

- [ ] All `.env` files gitignored and not in history
- [ ] JWT secrets rotated from dev defaults
- [ ] MongoDB Atlas IP allowlist restricted
- [ ] Demo seed passwords changed or demo users removed
- [ ] `NODE_ENV=production` on backend

### Infrastructure

- [ ] MongoDB Atlas seeded
- [ ] Backend health check returns `"database": "connected"`
- [ ] Frontend loads without console errors
- [ ] CORS allows Vercel origin
- [ ] Socket.io connects (chat feature)

### Providers (when going live)

- [ ] Amadeus API keys (live inventory)
- [ ] Anthropic API key (AI Concierge)
- [ ] Razorpay live keys + webhook URL
- [ ] Resend or SMTP (booking emails)
- [ ] Cloudinary (image uploads)

### QA

- [ ] `npm run build` — frontend green
- [ ] `API_URL=https://your-api npm run qa` — 58/58 passing
- [ ] Login/signup works on deployed URL
- [ ] Booking flow completes (demo or live payment)
- [ ] AI Concierge responds at `/concierge`

### Legal & launch (before public beta)

- [ ] Privacy policy & terms pages
- [ ] OG images in `public/og/`
- [ ] Intro videos in `public/videos/` (optional)

---

## 10. Verification commands

### Local (before push)

```bash
# Frontend
npm run build

# Backend (terminal 1: npm run dev)
cd backend && npm run qa
```

### Against deployed API

```bash
cd backend
API_URL=https://YOUR-API-URL npm run smoke   # 29 tests
API_URL=https://YOUR-API-URL npm run qa      # 58 tests
```

### Manual health checks

```bash
curl https://YOUR-API-URL/api/health
curl https://YOUR-API-URL/api/inventory/status
```

Expected health response:

```json
{
  "success": true,
  "database": "connected",
  "environment": "production"
}
```

---

## Quick reference

| Service | URL after deploy |
|---------|------------------|
| Frontend | `https://YOUR-PROJECT.vercel.app` |
| Backend | `https://YOUR-API.up.railway.app` |
| Database | MongoDB Atlas → `xoxo-travels` |
| GitHub | `https://github.com/YOUR_ORG/xoxo-travels` |

---

## Support docs

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Local dev setup |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Quick deploy reference |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Detailed ops guide |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Team workflow |
| [backend/.env.production.example](./backend/.env.production.example) | Backend env template |

---

_Deployment requires only logging into GitHub, Vercel, Railway/Render, and MongoDB Atlas — no CLI deploy commands are run automatically from this repository._

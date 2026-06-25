# Deployment — Quick Reference

_For the complete guide, see [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md)._

---

## Architecture

| Layer | Platform | Root directory |
|-------|----------|----------------|
| Frontend | **Vercel** | `/` (repository root) |
| Backend API | **Railway** or **Render** | `/backend` |
| Database | **MongoDB Atlas** | `xoxo-travels` database |
| File uploads | Cloudinary (optional) | — |

---

## Pre-deploy checklist

- [ ] MongoDB Atlas cluster created & seeded
- [ ] Backend env vars set on Railway/Render
- [ ] Frontend env vars set on Vercel
- [ ] `CLIENT_URL` and `ALLOWED_ORIGINS` match Vercel URL
- [ ] JWT secrets ≥ 32 characters (generate with `openssl rand -hex 32`)
- [ ] `npm run build` green
- [ ] `npm run qa` green against deployed API

---

## Config files

| File | Platform |
|------|----------|
| `vercel.json` | Vercel (frontend) |
| `backend/railway.toml` | Railway (backend) |
| `backend/render.yaml` | Render (backend) |
| `backend/Dockerfile` | Docker builds (Railway/Render) |
| `backend/.env.production.example` | Backend env template |

---

## Environment templates

```bash
# Frontend
cp .env.example .env.local

# Backend
cd backend && cp .env.production.example .env
```

Set values in each platform's dashboard — **never commit filled `.env` files**.

---

## Health checks

| Service | URL |
|---------|-----|
| API | `GET /api/health` |
| Inventory | `GET /api/inventory/status` |

---

## Detailed documentation

- [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md) — step-by-step
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) — architecture & ops
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) — launch checklist
- [docs/integrations/](./docs/integrations/) — provider setup

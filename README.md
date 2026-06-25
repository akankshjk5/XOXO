# XOXO.TRAVEL

India's social travel super-app — AI-powered trip planning, packages, bookings, and traveler community.

**Stack:** Next.js 14 (frontend) · Express + MongoDB (backend) · Socket.io (real-time chat)

---

## Repository structure

```
xoxo-travels/
├── app/                 # Next.js App Router pages
├── components/          # React UI components
├── lib/                 # API client, utilities
├── hooks/               # React hooks
├── public/              # Static assets (videos, images, OG)
├── backend/             # Express API (separate deploy)
│   ├── src/
│   ├── scripts/         # Smoke & QA tests
│   └── Dockerfile
├── docs/                # Integration & ops documentation
└── supabase/            # Optional Supabase migrations (legacy middleware)
```

---

## Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- **MongoDB** — local (`mongodb://localhost:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- npm 9+

---

## Local development

### 1. Frontend

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL if backend runs elsewhere

npm install
npm run dev
```

Open http://localhost:3000

### 2. Backend

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI and JWT secrets

npm install
npm run dev
```

API: http://localhost:5000 · Health: http://localhost:5000/api/health

### 3. Seed database (first run)

```bash
cd backend
npm run seed
```

Creates destinations, packages, and demo users (`demo@xoxotravels.com`, `admin@xoxotravels.com`). Passwords are set in `src/seed.js` for local dev only.

---

## Scripts

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run dev` | root | Start Next.js dev server |
| `npm run build` | root | Production build |
| `npm run lint` | root | ESLint |
| `npm run dev` | backend | Start API with nodemon |
| `npm run seed` | backend | Seed MongoDB |
| `npm run smoke` | backend | 29 API smoke tests |
| `npm run qa` | backend | 58 API tests (smoke + extended) |

---

## Deployment

See **[GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md)** for full instructions:

- Private GitHub repository setup
- **Vercel** — frontend
- **Railway** or **Render** — backend API
- **MongoDB Atlas** — production database

Quick reference: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Documentation

| Doc | Description |
|-----|-------------|
| [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md) | End-to-end deploy guide |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Detailed ops & architecture |
| [AI_CONCIERGE_ARCHITECTURE.md](./AI_CONCIERGE_ARCHITECTURE.md) | AI Concierge system design |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Feature & QA status |
| [docs/integrations/](./docs/integrations/) | Provider integration guides |

---

## Environment variables

Never commit `.env` or `.env.local`. Use:

- **Frontend:** `.env.example` → `.env.local`
- **Backend:** `backend/.env.example` → `backend/.env`

---

## License

Proprietary — see [LICENSE](./LICENSE). All rights reserved.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

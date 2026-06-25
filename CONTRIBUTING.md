# Contributing to XOXO.TRAVEL

Thank you for contributing to this private repository.

---

## Getting started

1. Clone the repository (access must be granted by the repo owner).
2. Follow [README.md](./README.md) for local setup.
3. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development standards

- **Node 20+** — use `.nvmrc` (`nvm use`)
- **No secrets in code** — use `.env` files (gitignored)
- **No business logic in docs-only PRs** — keep changes focused
- Run tests before opening a PR:
  ```bash
  npm run build          # frontend (from root)
  cd backend && npm run qa
  ```

---

## Branch naming

| Prefix | Use |
|--------|-----|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Tooling, deps, docs |
| `deploy/` | Infrastructure only |

---

## Commit messages

Use clear, imperative sentences:

```
Add concierge share token endpoint
Fix CORS for guest session header
Update Vercel env documentation
```

---

## Pull request checklist

- [ ] `npm run build` passes (frontend)
- [ ] `npm run qa` passes (backend, API running)
- [ ] No `.env` files committed
- [ ] No `console.log` left in production paths
- [ ] README or deployment docs updated if env/deploy changed

---

## Code review

All changes to `main` require review. Do not force-push to `main`.

---

## Security

- Report vulnerabilities privately to the repository owner.
- Never commit API keys, JWT secrets, or database credentials.
- Rotate secrets immediately if accidentally exposed.

---

## Questions

Refer to [PROJECT_STATUS.md](./PROJECT_STATUS.md) and [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md).

# Frontend

Next.js App Router UI for **KC-Project** v1.0.0.

The frontend is an **untrusted client**. Product pages apply client-side filtering; the API is the real security boundary.

Ground truth: [v1.0.0-ground-truth.md](../docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md)

---

## Current status (v1.0.0)

- Next.js 16, React 19, Tailwind CSS
- Types from OpenAPI (`lib/types.gen.ts` via `npm run generate:types`)
- **Product UI:** role-aware pages with owner scoping (`lib/file-scope.ts`)
- **Dev explorers:** `/dev/*` raw API views (ADR-028)
- **Public share:** `/share/[token]` landing page
- Friendly share URLs via `sharingFriendlyUrl()` (not raw API paths)

---

## Routes

| Path | Guard | Purpose |
|------|-------|---------|
| `/` | None | Home, demo accounts |
| `/auth` | None | Login / register |
| `/files`, `/files/[id]` | Auth | My files (client-filtered) |
| `/sharing` | Auth | My shares |
| `/share/[token]` | None | Public download landing |
| `/moderator` | Mod+admin | Approval queue |
| `/admin` | Admin | Users, stats, all files |
| `/dev/*` | None | API explorers |

---

## Run

### Docker prod

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
# http://localhost:8080
```

### Native dev

```bash
docker compose -f infra/compose.yml up -d
cd backend && npm run start:dev
npm run dev   # :3000, API at localhost:4000
```

---

## API client

All backend calls go through `lib/api.ts`. Components must not call `fetch()` directly.

---

## Verify

```bash
./infra/smoke-test.sh
./infra/journey-test.sh   # includes /share/share-1 UI check
```

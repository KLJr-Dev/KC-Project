# Frontend

Next.js App Router UI for **KC-Project** **v2.1.0** (secure product on `main`).

The frontend is an **untrusted client**. Product pages apply client-side filtering; the API is the real security boundary.

SoftDev UI work lands on the **`frontend`** branch → `dev` → `main` ([ADR-032](../docs/decisions/ADR-032-post-v2.1.0-versioning.md)).

Cycle-1 before-state UX notes: [v1.0.0-ground-truth.md](../docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md) · tag `v1.0.0`.

---

## Current status (v2.1.0)

- Next.js 16, React 19, Tailwind CSS
- Types from OpenAPI (`lib/types.gen.ts` via `npm run generate:types`)
- Auth: access JWT in memory + httpOnly refresh cookie (legacy `kc_auth` localStorage cleared)
- **Product UI:** role-aware pages with owner scoping (`lib/file-scope.ts`)
- **Dev explorers:** `/dev/*` raw API views (ADR-028; lab-gated in prod)
- **Public share:** `/share/[token]` landing page

---

## Routes

| Path | Guard | Purpose |
|------|-------|---------|
| `/` | None | Home, demo accounts (lab) |
| `/auth` | None | Login / register |
| `/files`, `/files/[id]` | Auth | My files (client-filtered) |
| `/sharing` | Auth | My shares |
| `/share/[token]` | None | Public download landing |
| `/moderator` | Mod+admin | Approval queue |
| `/admin` | Admin | Users, stats, all files |
| `/dev/*` | Lab flag | API explorers |

---

## Run

### Docker prod

```bash
# from repo root — see infra/README.md
docker compose -f infra/docker-compose.prod.yml up -d --build
```

### Native dev

```bash
npm run dev   # :3000 — expects API on :4000
```

### Regenerate OpenAPI types

```bash
# backend must be running with Swagger enabled (native dev)
npm run generate:types
```

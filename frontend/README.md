# Frontend

Next.js App Router UI for **KC-Project** — secure tip tag **`v2.5.0`** on `main`; Cycle-9 insecure **`v1.6.0`** integrated on **`dev`**.

The frontend is an **untrusted client**. Product pages apply client-side filtering; the API is the real security boundary. Notes body is **plain text** (React-escaped) — C4-F01 closed ([ADR-033](../docs/decisions/ADR-033-cycle-4-softdev-version-pair.md)).

SoftDev UI work lands on the **`frontend`** branch → `dev` → `main` ([ADR-015](../docs/decisions/ADR-015-branching-strategy.md)).

---

## Current status

- Next.js 16, React 19, Tailwind CSS
- Types from OpenAPI (`lib/types.gen.ts`) + manual Notes types
- Auth: access JWT in memory + httpOnly refresh cookie
- **Product UI:** files, notes, intake/onboarding, security ops, sharing, moderator, admin
- **Dev explorers:** `/dev/*` (lab-gated in prod)
- **Public share:** `/share/[token]`

---

## Routes

| Path | Guard | Purpose |
|------|-------|---------|
| `/` | None | Home, demo accounts (lab) |
| `/auth` | None | Login / register |
| `/files`, `/files/[id]` | Auth | My files |
| `/notes`, `/notes/[id]` | Auth | Notes (plain-text body) |
| `/sharing` | Auth | My shares |
| `/share/[token]` | None | Public download landing |
| `/ops` | Auth | Ops documents (path-confined) |
| `/intake` | Auth | Staff search + onboarding requests |
| `/intake/queue` | Mod+admin | Onboarding approval queue |
| `/moderator` | Mod+admin | File approval queue |
| `/admin` | Admin | Users, stats, all files |
| `/admin/security` | Admin | Security Ops posture + events |
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

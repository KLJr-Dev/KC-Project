# Frontend

Next.js App Router UI for **KC-Project** SoftDev tip on `main` (Notes XSS intentional; tag **`v1.2.0`** pending).

The frontend is an **untrusted client**. Product pages apply client-side filtering; the API is the real security boundary. SoftDev Notes **intentionally** render HTML/markdown unsafely ([ADR-033](../docs/decisions/ADR-033-cycle-4-softdev-version-pair.md)).

SoftDev UI work lands on the **`frontend`** branch → `dev` → `main` ([ADR-015](../docs/decisions/ADR-015-branching-strategy.md)).

**Last secure product tag:** `v2.1.0` — pin for hardened demos until `v2.2.0`.

---

## Current status (SoftDev tip)

- Next.js 16, React 19, Tailwind CSS
- Types from OpenAPI (`lib/types.gen.ts`) + manual Notes types
- Auth: access JWT in memory + httpOnly refresh cookie
- **Product UI:** files, **notes**, sharing, moderator, admin
- **SoftDev XSS:** `/notes/[id]` HTML + `unsafe-markdown.ts`
- **Dev explorers:** `/dev/*` (lab-gated in prod)
- **Public share:** `/share/[token]`

---

## Routes

| Path | Guard | Purpose |
|------|-------|---------|
| `/` | None | Home, demo accounts (lab) |
| `/auth` | None | Login / register |
| `/files`, `/files/[id]` | Auth | My files |
| `/notes`, `/notes/[id]` | Auth | SoftDev Notes (XSS sinks) |
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

# Infrastructure

Deployment and infrastructure for **KC-Project**.

**Tip policy:** tip (`main` / current SoftDev) holds **evergreen** compose + gates + Blue/unpublished asserts. Closed-cycle plant overlays and examiners live on **`ctf/v1.x.0` / tags** — checkout the box, then use its compose files (do not expect prior overlays on tip).

**Current hardened tip:** **`v2.5.0`** on `main`.  
**Cycle-9 insecure (on `dev`):** prod compose only — `./infra/cycle9-examiner.sh` after `./infra/smoke-test.sh`.  
**Insecure Cycle-8 replay:** tag / **`ctf/v1.5.0`** — overlay on that checkout only.  
**Optional tip noise:** `docker-compose.lab-host.yml` — SSH `:2222` only (no `:8787`).

Canonical: [STRATEGY.md](../docs/roadmap/STRATEGY.md) · [ADR-036](../docs/decisions/ADR-036-cycle-8-intake-tool-chain-pair.md).

---

## Dual deploy paths (tip)

| Path | Compose file | Use case | Entry |
|------|--------------|----------|-------|
| **Secure / lab (primary)** | `docker-compose.prod.yml` | Day-to-day, journeys, smoke (**loopback HTTP OK**) | `http://localhost:8080` |
| **TLS profile** | `prod` + `docker-compose.tls.yml` | **Required for LAN / recruiter secure demos** | `https://localhost:8443` |
| **Lab-host noise (optional)** | `prod` + `docker-compose.lab-host.yml` | Hardened SSH-only sidecar — **no** kc-agent | SSH `:2222` |
| **Native dev** | `compose.yml` (DB only) | `npm run start:dev` on host | `:4000` API, `:3000` UI |

**Prior Red boxes:** checkout tag / `ctf/*` first — overlays ship **with that checkout** (e.g. `v1.5.0` → `docker-compose.cycle8.yml`; `v1.4.0` → `docker-compose.cycle7.yml`). See [USAGE.md](../USAGE.md).

**C4-F03 / C5 / C7 / C8 policy:** Prod compose alone must not publish plant ports — `./infra/assert-ssh-unpublished.sh`, `assert-cycle7-unpublished.sh`, `assert-cycle8-unpublished.sh`.

**LAN / off-loopback:** Do not advertise cleartext `:8080` on a reachable NIC as “secure.” Use the TLS overlay. Loopback HTTP remains an accepted residual (R-01).

```mermaid
flowchart TB
    subgraph pentest [Pentest path]
        prodCompose[docker-compose.prod.yml]
        nginx[nginx :8080]
        prodCompose --> nginx
    end
    subgraph dev [Dev path]
        devCompose[compose.yml PG only]
        nativeBE[backend :4000]
        devCompose --> nativeBE
    end
```

**Warning:** Prod uses `pgdata_prod` / `kc_prod`. Dev uses `pgdata` / `kc_dev`. Mixing volumes causes `database "kc_prod" does not exist`.

---

## Quick start (pentest / production stack)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
```

App: `http://localhost:8080` — API at `/api/*` (including `/api/intake/*` via Nest BFF → FastAPI; Cycle-9).

### TLS profile

```bash
chmod +x infra/scripts/gen-lab-certs.sh infra/tls-smoke.sh
./infra/scripts/gen-lab-certs.sh
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.tls.yml up -d --build
./infra/tls-smoke.sh
```

App: `https://127.0.0.1:8443` (HTTP `:8080` redirects). Certs live in `infra/certs/` (gitignored).

---

## Quick start (native dev)

```bash
docker compose -f infra/compose.yml up -d
cd backend && npm run start:dev   # :4000
cd frontend && npm run dev        # :3000
```

---

## Environment (`.env.example`)

Copy to `infra/.env` before prod compose. Loaded via `env_file` in `docker-compose.prod.yml`.

| Variable | Default | Notes |
|----------|---------|-------|
| `DB_HOST` | `postgres` | Docker service name |
| `DB_PORT` | `5432` | Internal port |
| `DB_ADMIN_USER` / `DB_ADMIN_PASSWORD` | `postgres` / strong | Superuser for init + migrations only |
| `DB_USER` / `DB_PASSWORD` | `kc_app` / strong | Runtime DML role (C2-F07 least-priv) |
| `DB_NAME` | `kc_prod` | Prod database |
| `NEXT_PUBLIC_API_URL` | `/api` | Browser-relative API path |
| `INTAKE_DB_NAME` | `kc_intake` | Intake microservice DB |

---

## Operator note — access JWT vs refresh cookie (C2-F06)

- **Access JWT** (Bearer): ~15 minutes (`JWT_EXPIRES_IN`). Shell `$TOKEN` goes stale → **401** (not necessarily a failed exploit).
- **Refresh**: httpOnly cookie (`kc_refresh`); SPA silent-refresh via `/api/auth/refresh`. Re-login or refresh when probing after TTL.

---

## Verification scripts (tip)

```bash
chmod +x infra/*.sh infra/postgres/init/*.sh
```

| Script | Prereq | Purpose |
|--------|--------|---------|
| `assert-pg-unpublished.sh` | compose file | Prod compose must not publish `:5433` (C2-F03) |
| `assert-ssh-unpublished.sh` | compose file | Prod compose must not publish `:2222` |
| `assert-cycle7-unpublished.sh` | compose file | Prod must not publish retired C7 ports/services |
| `assert-cycle8-unpublished.sh` | compose file | Prod must not publish C8 `:21` / `:22` / `cycle8-*` |
| `cycle6-blue-assert.sh` | Full prod tip | Preview SSRF + bookmark CSRF closed (via smoke) |
| `cycle7-blue-assert.sh` | Full prod tip | Ops path confinement; no F1 plant (via smoke) |
| `cycle8-blue-assert.sh` | Full prod tip | Intake SQLi closed; no C8 flags in search (via smoke) |
| `cycle9-examiner.sh` | Full prod tip (`v1.6.0`) | Onboarding F1–F4 + honeypot; ping not `/health` |
| `smoke-test.sh` | Full prod stack on `:8080` | Unpublished asserts + ping → register → upload + C6/C7/C8 Blue |
| `journey-test.sh` | Full prod stack | 3 roles, demo share, IDOR deny |
| `tls-smoke.sh` | Prod + TLS overlay | HTTPS / HSTS / Secure cookie |
| `e2e-docker.sh` | Docker | Backend e2e via `docker-compose.e2e.yml` |
| `vm-setup.sh` | Ubuntu + sudo | Bootstrap VM + smoke/journey |

### Full verify gate (prod alone)

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/cycle9-examiner.sh
./infra/journey-test.sh
./infra/e2e-docker.sh
./infra/scripts/gen-lab-certs.sh
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.tls.yml up -d --build
./infra/tls-smoke.sh
```

### Replay prior boxes

Checkout the tag / `ctf/*` branch first — plant compose + examiner files are **on that revision**, not on tip after retirement.

```bash
git checkout ctf/v1.5.0   # Cycle-8 example
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle8.yml up -d --build
./infra/cycle8-examiner.sh
```

---

## Tip contents

| File | Purpose |
|------|---------|
| `compose.yml` | Dev PostgreSQL only (`kc_dev`, `:5432`) |
| `docker-compose.prod.yml` | Full stack: postgres, backend, frontend, intake, nginx |
| `docker-compose.tls.yml` / `nginx-tls.conf` | TLS profile |
| `docker-compose.lab-host.yml` | Optional SSH noise |
| `docker-compose.e2e.yml` | e2e Postgres publish |
| `nginx.conf` | Default edge — all `/api/*` → Nest (Intake BFF proxies FastAPI; no nginx→intake direct) |
| `assert-*-unpublished.sh` | Prod-alone port/service locks |
| `cycle*-blue-assert.sh` | Prior Blue regression |
| `smoke-test.sh` / `journey-test.sh` / `e2e-docker.sh` / `tls-smoke.sh` / `vm-setup.sh` | Gates |
| `postgres/init/` | First-boot `kc_app` role |
| `.env.example` | Prod env template → `.env` |

Cycle-8 overlay (`docker-compose.cycle8.yml`, `cycle8/`, `nginx-cycle8.conf`, `cycle8-examiner.sh`) **retired from tip** — replay on `ctf/v1.5.0` only.

---

## Migrations

Backend entrypoint runs `migrate-and-grant` as **DB admin**, then Nest starts as **`kc_app`** with `MIGRATIONS_RUN=false`.

```bash
cd backend && npm run migration:run   # local CLI (admin creds)
```

See [ADR-022](../docs/decisions/ADR-022-typeorm-migrations.md).

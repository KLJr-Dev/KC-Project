# Infrastructure

Deployment topology for v1.0.0 (Docker prod, intentionally insecure) and v2.0.0 (hardened). v1.0.x pentest **requires** prod compose — not native dev.

---

## v1.0.0 — Docker prod (`docker-compose.prod.yml`)

nginx at `:8080` proxies to internal frontend/backend. PostgreSQL internal with host `:5433` for e2e. Separate `pgdata_prod` volume from dev `pgdata`.

### Topology

```mermaid
flowchart TD
  subgraph host ["Host"]
    subgraph prod ["docker-compose.prod.yml"]
      Nginx["nginx\n0.0.0.0:8080\n1 MB body limit"]
      FE["frontend\nNext.js :3000\nNEXT_PUBLIC_API_URL=/api"]
      BE["backend\nNestJS :4000\nJWT_SECRET=kc-secret"]
      PG["postgres :5432\n0.0.0.0:5433\nkc_prod\npostgres/postgres"]
      UploadsVol["volume: uploads"]
      PGDataVol["volume: pgdata_prod"]
    end
  end

  Browser["Browser"] -->|"HTTP :8080"| Nginx
  Nginx -->|"/"| FE
  Nginx -->|"/api"| BE
  FE -->|"/api"| Nginx
  BE --> PG
  BE --- UploadsVol
  PG --- PGDataVol
```

### Deploy

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
./infra/e2e-docker.sh   # 150 tests
```

Browser: `http://localhost:8080`

### Intentional misconfigurations

| Misconfiguration | CWE | Impact |
|------------------|-----|--------|
| Default DB credentials | CWE-798 | Trivial DB access via :5433 |
| No TLS | CWE-319 | Plaintext tokens/passwords |
| JWT secret hardcoded | CWE-798 | Forge any role |
| nginx 1 MB body limit | — | Uploads >1 MB return 413 before Multer |
| Root containers | CWE-250 | Container escape risk |
| Permissive CORS | CWE-942 | Any origin can call API |

---

## Dev — PostgreSQL only (`compose.yml`)

Native development path. DB in Docker; backend/frontend via `npm run start:dev`.

```mermaid
flowchart LR
  DevBrowser["Browser :3000"]
  DevFE["Next.js native :3000"]
  DevBE["NestJS native :4000"]
  DevPG["postgres :5432\nkc_dev\npgdata volume"]

  DevBrowser --> DevFE
  DevFE -->|"localhost:4000"| DevBE
  DevBE --> DevPG
```

```bash
docker compose -f infra/compose.yml up -d   # kc_dev on :5432
# backend: npm run start:dev
# frontend: npm run start:dev
```

**Do not** use `pgdata` for prod — prod uses `pgdata_prod` in `docker-compose.prod.yml`.

---

## v2.0.0 — Hardened with nginx

nginx reverse proxy terminates TLS and is the only externally-facing service. Backend and database on internal network with no host port mappings.

```mermaid
flowchart TD
  subgraph vm ["Ubuntu VM (public IP)"]
    subgraph compose ["docker-compose"]
      subgraph public_net ["public network"]
        Nginx["nginx\n0.0.0.0:443\nTLS termination\nrate limiting\nHSTS, CSP, X-Frame-Options\nnon-root"]
      end
      subgraph internal_net ["internal network (no external gateway)"]
        FE["frontend\nnon-root\nread-only FS"]
        BE["backend\nnon-root\nsecrets"]
        PG["postgres\nno host port"]
        UploadsVol["volume: uploads"]
        PGDataVol["volume: pgdata"]
      end
    end
  end

  Internet["Internet"] -->|"HTTPS :443 only"| Nginx
  Nginx --> FE
  Nginx --> BE
  BE --> PG
  BE --- UploadsVol
  PG --- PGDataVol
```

---

## Delta Table (v1.0.0 prod → v2.0.0)

| Area | v1.0.0 prod | v2.0.0 hardened | CWE / OWASP |
|------|-------------|-----------------|-------------|
| External access | `:8080` nginx HTTP | `:443` nginx HTTPS only | CWE-668 / A02:2025 |
| DB access | `:5433` default creds | Internal only, Docker secrets | CWE-798, CWE-668 |
| JWT | Hardcoded `kc-secret` HS256 | RS256, env/secrets | CWE-347 / A04:2025 |
| Container user | root | Non-root (UID 1001) | CWE-250 / A02:2025 |
| CORS | Permissive | Strict origin whitelist | CWE-942 / A02:2025 |
| Logging | Sensitive data in logs | Redacted structured logs | CWE-532 / A09:2025 |

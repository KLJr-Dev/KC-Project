# Cycle-3 leak-crack-db — Secure-Ready Declaration

Formal gate: secure track **resists** the Cycle-3 CTF chain without merging CTF code into `main`.  
Counterpart to [leak-crack-db-ctf-ready.md](https://github.com/KLJr-Dev/KC-Project/blob/ctf/leak-crack-db/docs/release/leak-crack-db-ctf-ready.md) (on CTF branch).

**Branch:** `remediation/cycle-3-leak-crack-db` · **Plan:** [blue-team-plan.md](../security/Cycle-3/Remediation/blue-team-plan.md) · **Map:** [cycle-3-leak-crack-db-remediation.md](../security/Cycle-3/Remediation/cycle-3-leak-crack-db-remediation.md)  
**CTF evidence (frozen):** `ctf/leak-crack-db`  
**Product version:** stays **`v2.1.0`** ([ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md))

---

## Findings C3-F01…F06 — secure expectation

| ID | Secure expectation | Status |
|----|--------------------|--------|
| C3-F01 | No ops-reminder MD5 plant on secure | **Verified** |
| C3-F02 | No `CTF_MODE` SQLi; `q` → 400 / ignored | **Verified** |
| C3-F03 | Host `:5433` closed on prod compose | **Verified** |
| C3-F04 | Loopback HTTP = R-01; LAN → TLS | **Accepted residual** |
| C3-F05 | Swagger off by default | **Verified** |
| C3-F06 | RLS story CTF-only | **Accepted note** |

---

## Verification (operator)

```bash
git checkout remediation/cycle-3-leak-crack-db
# Compose config only — no CTF overlay
./infra/assert-pg-unpublished.sh

# No CTF artifacts on this tree
test ! -e infra/docker-compose.ctf-leak.yml
test ! -d backend/src/ctf

# Regression (Jest) — needs a reachable Postgres (e.g. e2e overlay on :5433/5434)
cd backend && DB_HOST=localhost DB_PORT=5434 DB_USER=postgres DB_PASSWORD=… DB_NAME=kc_prod \
  npx jest --config ./test/jest-e2e.json --runInBand --testPathPatterns=cycle-3-regression --forceExit

# Day-to-day stack (optional full)
# docker compose -f infra/docker-compose.prod.yml up -d --build
# ./infra/smoke-test.sh && ./infra/journey-test.sh
```

---

## Gate checklist

- [x] CTF branch frozen (`ctf/leak-crack-db`)  
- [x] No CTF compose / `CTF_MODE` / CTF seeds on this branch  
- [x] `assert-pg-unpublished.sh` green  
- [x] Cycle-3 regression e2e green  
- [x] Remediation docs + Blue plan + residuals  
- [x] Bucket B FC-09/10/11 marked Consumed  
- [x] No `vX.Y.Z` bump  

**Gate status: READY TO MERGE** → `main` (then freeze this remediation branch).

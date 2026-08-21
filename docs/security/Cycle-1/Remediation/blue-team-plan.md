# Blue Team Plan — Cycle 1 → v2.0.0

**Branch:** `remediation/v2.0.0`  
**Secure-ready gate:** [v2.0.0-secure-ready.md](../../../release/v2.0.0-secure-ready.md)  
**Finding → fix map:** [v2.0.0-remediation.md](v2.0.0-remediation.md)  
**Accepted residuals:** [accepted-residuals-m8.md](accepted-residuals-m8.md)  
**Pentest evidence (frozen):** [v1.0.0-writeup.md](../PenTest/v1.0.0-writeup.md) on `pentest/cycle-1`  
**Control checklist:** [security-baseline.md](../../../spec/security-baseline.md)

| Field | Value |
|-------|-------|
| Cycle | 1 (ADR-013 / ADR-031) |
| From | v1.0.0 insecure MVP (pentest complete) |
| To | v2.0.0 secure parallel (**full** security-baseline) |
| Current milestone | **Cycle-1 closed** — tag `v2.0.0` on `main` |
| Code status | Wave 1 + Wave 2 merged; secure-ready signed |

---

## Mission

Ship a functionally equivalent **secure parallel** of KC-Project that **fails** Cycle-1 PoCs and meets [security-baseline.md](../../../spec/security-baseline.md), while legitimate user / moderator / admin journeys still work.

**Success** = F-01…F-13 addressed · baseline controls verified · smoke / journey / e2e / tls-smoke green · [v2.0.0-secure-ready.md](../../../release/v2.0.0-secure-ready.md) signed · tag `v2.0.0`.

**CTF blocked** until after tag `v2.0.0` (ADR-013 fork-from-secure → v1.1.0).

---

## Two waves

```text
v1.0.0 ──► pentest/cycle-1 (evidence frozen)
              │
              ▼
         remediation/v2.0.0
              │
   Wave 1: M0–M4 (Cycle-1 finding close-out)
              │
   Wave 2: M5–M9 (actual baseline → tag)
              │
              ▼
         merge main · tag v2.0.0
              │
              ▼
         later: v1.1.0 CTF (fork secure)
```

| Wave | Milestones | Intent |
|------|------------|--------|
| **1** | M0–M4 | Close F-01…F-13; authz, shares, disclosure, RS256 refresh, CORS/headers |
| **2** | M5–M9 | Full baseline: bcrypt, cookies, TLS profile, ops hardening, gate + tag |

---

## Wave 1 — Cycle-1 close-out (done)

| Milestone | Focus | Status |
|-----------|--------|--------|
| M0 | Plans, remediation map, secure-ready scaffold | **Done** |
| M1 | File ownership; admin HasRole; DB role; JWT env + exp | **Done** |
| M2 | Postgres unpublished; random share tokens + expiry | **Done** |
| M3 | Swagger/lab UI gates; generic auth errors | **Done** |
| M4 | CORS; nginx headers; RS256 + refresh; upload sanitize/MIME | **Done** |

---

## Wave 2 — Actual baseline (M5–M9)

| Milestone | Focus | Status |
|-----------|--------|--------|
| M5 | bcrypt 12+; password policy; prod RS-only boot; ROLE_RANK; SQL logging off in prod | **Done** |
| M6 | httpOnly refresh cookie; access JWT memory-only; CSRF header on refresh | **Done** |
| M7 | `docker-compose.tls.yml`; certs script; HSTS; `tls-smoke.sh` | **Done** |
| M8 | Rate limits; non-root; path containment; share ownership; Permissions-Policy; log redaction | **Done** |
| M9 | Docs rewrite; full suite green; merge `main`; tag `v2.0.0` | **Done** |

---

## Working agreements

| Rule | Practice |
|------|----------|
| Freeze Red evidence | Do not rewrite PoCs on `pentest/cycle-1` |
| Full baseline DoD | Tag only after Wave 2 + secure-ready signed |
| Secrets | Env / file mounts; no new hardcoded JWT/DB passwords |
| Demo / `/dev` | Off in prod builds (`NEXT_PUBLIC_ENABLE_LAB_UI`) |
| CTF later | **v1.1.0** only after tag `v2.0.0` |

---

## Test / gate scripts

| Script | Expectation |
|--------|-------------|
| `infra/smoke-test.sh` | Happy path green (HTTP `:8080`) |
| `infra/journey-test.sh` | 3 roles + share + IDOR deny |
| `infra/e2e-docker.sh` | Inverted / secure e2e green |
| `infra/tls-smoke.sh` | HTTPS `:8443` + HSTS + Secure cookie (pre-tag) |

---

## Definition of Done (tag `v2.0.0`)

- [x] Wave 1 (M0–M4) complete
- [x] Wave 2 code (M5–M8) complete
- [x] Each F-01…F-13 **Verified** or **Accepted residual**
- [x] Sequential IDs documented as accepted residual ([accepted-residuals-m8.md](accepted-residuals-m8.md))
- [x] `v2.0.0-secure-ready.md` fully checked (M9 gate run 2026-08-21)
- [x] smoke + journey + e2e-docker + tls-smoke green
- [x] `pentest/cycle-1` left intact
- [x] Merge → `main` · tag **`v2.0.0`**
- [x] CTF work not started until after tag

---

## Next after tag

1. ~~Merge `remediation/v2.0.0` → `main`, tag `v2.0.0`.~~ **Done.**  
2. Design **v1.1.0** CTF: fork tag `v2.0.0`, misconfigure + plant flags (no new routes); Cycle-2 workspace.

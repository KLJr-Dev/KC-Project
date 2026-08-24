# Remediation Report — Cycle-3 `ctf/leak-crack-db`

**Cycle:** 3 · **Source pentest:** [`ctf/leak-crack-db` writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/leak-crack-db/docs/security/Cycle-3/PenTest/v1-leak-crack-db-writeup.md)  
**Harden from:** secure tag **`v2.1.0` / `main`**  
**Branch:** `remediation/cycle-3-leak-crack-db`  
**Status:** Verified — CTF breaks never landed on secure `main`; regression lock + docs  
**Product version bump:** none ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md))

---

## Finding → fix map

| ID | Severity | Secure expectation | How verified on this branch |
|----|----------|--------------------|-----------------------------|
| **C3-F01** | Critical | No ops-reminder plant / MD5-of-DB-password share | No CTF seed migration; demo shares are welcome.txt only |
| **C3-F02** | Critical | No string-concat SQLi on `q`; no `CTF_MODE` | No `backend/src/ctf/`; `q` not on DTO → **400** with ValidationPipe; findAll ignores unknown props |
| **C3-F03** | Critical | Postgres unpublished; no `ctf_ro` / `LeakDb2026!` | `assert-pg-unpublished.sh`; no CTF compose on main |
| **C3-F04** | Medium | Loopback HTTP residual (R-01); LAN → TLS | Existing TLS overlay + policy (Cycle-2 residual) |
| **C3-F05** | Info | Swagger gated | `ENABLE_SWAGGER=false` default in prod compose |
| **C3-F06** | Info | RLS tier split was CTF design | Documented; no secure action required |

---

## What Blue does *not* do

- Merge `docker-compose.ctf-leak.yml`, `CTF_MODE`, or `SeedLeakCrackCtf` into `main`  
- “Fix” code on frozen `ctf/leak-crack-db`  
- Bump `vX.Y.Z` for this cycle  

---

## Acceptance checklist

1. [x] Red evidence frozen on `ctf/leak-crack-db`  
2. [x] Branch `remediation/cycle-3-leak-crack-db` from `main`  
3. [x] C3-F01/F02/F03 closed on secure path (verified)  
4. [x] Cycle-3 regression suite + `assert-pg-unpublished.sh`  
5. [x] Remediation docs land via this PR to `main`  
6. [x] No product version bump  

---

## Short / medium / long

### Short term
Secure demos never use CTF overlay. Keep Swagger off. Run smoke without CTF compose.

### Medium term
If SoftDev ships file search: **parameterized** `ILIKE` only — never concat. Keep plant seeds off `main`.

### Long term
Next CTF = new `ctf/<scenario>` fork ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md)). Freeze this remediation branch after merge.

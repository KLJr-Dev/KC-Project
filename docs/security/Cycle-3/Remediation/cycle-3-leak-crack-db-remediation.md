# Remediation Report — Cycle-3 `ctf/leak-crack-db`

**Cycle:** 3 · **Source pentest:** [../PenTest/v1-leak-crack-db-writeup.md](../PenTest/v1-leak-crack-db-writeup.md)  
**Fork / harden from:** secure tag **`v2.1.0` / `main`** (close CTF breaks introduced on `ctf/leak-crack-db`)  
**Status:** Planning — implement on `remediation/cycle-3-leak-crack-db` after Red freeze  
**Product version bump:** none (post-v2.1.0 policy: CTF scenario forks only — no `vX.Y.Z` invent for CTF-only work)

---

## Finding → fix map

| ID | Severity | Fix intent | Likely files / surfaces | Acceptance test |
|----|----------|------------|-------------------------|-----------------|
| C3-F01 | Critical | Remove ops-reminder plant + public share seed from secure path; never ship MD5-of-DB-password in shares | CTF migration `SeedLeakCrackCtf`, Sharing seed | Secure compose: no `ops-reminder.txt` share; no plant body |
| C3-F02 | Critical | No string-concat SQL on `q`; parameterized `ILIKE` only if product search ships; `CTF_MODE` path must not exist on `main` | `files.service.ts`, `pagination-query.dto.ts`, `ctf-mode.ts` | Malicious `q` ignored or safe on secure path; no UNION exfil |
| C3-F03 | Critical | Do not publish Postgres on secure compose; no `ctf_ro` / crackable lab password on secure; drop CTF overlay from day-to-day | `docker-compose.prod.yml`, CTF overlay only | Host `:5433` closed without overlay; `LeakDb2026!` not a live secure secret |
| C3-F04 | Medium | TLS for LAN demos; Secure cookies | `docker-compose.tls.yml`, cookie util | HTTPS login path documented |
| C3-F05 | Info | `ENABLE_SWAGGER=false` on secure | compose env | `/api/docs` not 200 on secure prod |
| C3-F06 | Info | Keep RLS story as accepted CTF design note; no secure regression | docs | Documented residual / control note only |

---

## Short / medium / long

See writeup §11. Operational checklist:

1. [ ] Freeze Red evidence on `ctf/leak-crack-db` (this gate)  
2. [ ] Branch `remediation/cycle-3-leak-crack-db` from `main` (`v2.1.0`)  
3. [ ] Close C3-F01 / F02 / F03 so secure path cannot replay the chain  
4. [ ] Confirm examiner / smoke green **without** CTF overlay  
5. [ ] Land Remediation docs on `main`; do **not** merge CTF compose/SQLi into `main`  
6. [ ] No product `vX.Y.Z` bump unless SoftDev expands surface in the same change  

---

## Out of scope for this remediation

- Re-opening Cycle-1/2 Criticals on `main`  
- XSS / SSRF / Metasploit / DNS rebind  
- SoftDev feature expansion (separate track)  
- “Fixing” vulns on frozen `ctf/leak-crack-db`

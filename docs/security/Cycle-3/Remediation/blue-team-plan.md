# Blue Team plan — Cycle-3 leak-crack-db

**Source:** [writeup on `ctf/leak-crack-db`](https://github.com/KLJr-Dev/KC-Project/blob/ctf/leak-crack-db/docs/security/Cycle-3/PenTest/v1-leak-crack-db-writeup.md)  
**Fix map:** [cycle-3-leak-crack-db-remediation.md](cycle-3-leak-crack-db-remediation.md)  
**CTF evidence (frozen):** `ctf/leak-crack-db`  
**Gate:** [../../../release/cycle-3-leak-crack-db-secure-ready.md](../../../release/cycle-3-leak-crack-db-secure-ready.md)

```text
v2.1.0 (main) ──► remediation/cycle-3-leak-crack-db ──► merge to main (docs + regression)
                      ▲
ctf/leak-crack-db (frozen) ──┘ findings only (do not merge CTF into main)
```

## Milestones

| ID | Goal | Status |
|----|------|--------|
| M0 | Plan signed (this doc + fix map) | **Done** |
| M1 | C3-F01 — no plant share / hash on secure path | **Verified** (never on main) |
| M2 | C3-F02 — no `CTF_MODE` SQLi; `q` rejected/ignored | **Verified** + e2e |
| M3 | C3-F03 — Postgres unpublished; no lab `ctf_ro` | **Verified** (`assert-pg-unpublished.sh`) |
| M4 | C3-F04 / F05 — TLS residual + Swagger gated | **Verified** (R-01 + defaults) |
| M5 | Smoke path + secure-ready gate + docs on branch | **Done** |

## Rules

- Freeze Red on `ctf/leak-crack-db` — no silent fixes there.  
- Secure defaults never enable `CTF_MODE` or CTF compose.  
- No product version bump ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md)).  

## Hand-off checklist

- [x] Red writeup accepted as input  
- [x] Branch `remediation/cycle-3-leak-crack-db` from `main`  
- [x] M1–M5 complete + gate green  
- [x] Merge remediation PR to `main` (#20)  
- [x] Freeze this remediation branch after merge

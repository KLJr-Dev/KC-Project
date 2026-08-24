# Blue Team plan — Cycle-3 leak-crack-db

**Source:** [../PenTest/v1-leak-crack-db-writeup.md](../PenTest/v1-leak-crack-db-writeup.md)  
**Fix map:** [cycle-3-leak-crack-db-remediation.md](cycle-3-leak-crack-db-remediation.md)  
**CTF evidence (frozen):** branch `ctf/leak-crack-db`

```text
v2.1.0 (main) ──► remediation/cycle-3-leak-crack-db ──► merge docs/fixes to main
                      ▲
ctf/leak-crack-db (frozen) ──┘ findings only (do not merge CTF into main)
```

## Milestones (sketch)

| ID | Goal | Status |
|----|------|--------|
| M0 | Plan signed (this doc + fix map) | **Open** |
| M1 | C3-F01 — no plant share / hash on secure path | Pending |
| M2 | C3-F02 — no `CTF_MODE` SQLi on `main`; safe `q` or ignore | Pending |
| M3 | C3-F03 — confirm Postgres unpublished; no lab `ctf_ro` on secure | Pending |
| M4 | C3-F04 / F05 — TLS guidance + Swagger gated | Pending |
| M5 | Smoke/journey green without overlay; Remediation docs on `main` | Pending |

## Rules

- Freeze Red evidence on `ctf/leak-crack-db` — no silent fixes there.  
- Secure defaults never enable `CTF_MODE` or CTF compose overlay.  
- No product version bump for CTF-only remediation (ADR-032).  

## Hand-off checklist

- [x] Red writeup accepted as input  
- [ ] Branch `remediation/cycle-3-leak-crack-db` from `main`  
- [ ] M1–M5 complete + gate green  
- [ ] Merge remediation to `main` (docs + any secure-path cleanup)

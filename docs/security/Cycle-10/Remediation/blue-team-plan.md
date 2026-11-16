# Blue Team plan — Cycle-10 → `v2.10.0`

**Branch:** `remediation/v2.10.0`  
**Finding → fix map:** [v2.10.0-remediation.md](v2.10.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md) — **empty**  
**Handoff:** [blue-handoff.md](blue-handoff.md)

| Field | Value |
|-------|-------|
| Cycle | 10 (Enterprise five-zone defence pair) |
| From | Intentional insecure tip `v1.10.0` |
| To | Tag **`v2.10.0`** — plants closed; Wave C production-grade; zero residuals |
| Current milestone | **M10** — gate / tag |

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0–M4** | Plants + Defense Ops + platform Wave A/B | F01–F05, D01–D02 | **Done** |
| **M5a** | Land A/B on branch | Commit Wave A/B | **Done** |
| **M6** | Wave C AppSec | Users IDOR, sharing DB role, lockout, helmet, MIME | **Done** |
| **M7** | Browser + secrets | CSP theme, Next/nginx headers, JWT secrets, register off | **Done** |
| **M8** | Containers + data/net | RO/caps, healthchecks, Blue reachability, edge :80 | **Done** |
| **M9** | Obs + demo/docs | Request-id, audit UUID, CI, demo strip, topology | **Done** |
| **M10** | Gate | smoke/assert green → secure-ready → tag | **In progress** |

## Out of scope

Full SIEM · mTLS edge→api · re-breaking C6–C9 · merging CTF · L3 fw router

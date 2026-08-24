# Blue Team plan — Cycle 2 → v2.1.0

**Branch:** `remediation/v2.1.0` (from `main` / tag `v2.0.0`)  
**Finding → fix map:** [v2.1.0-remediation.md](v2.1.0-remediation.md)  
**Residuals (Bucket A):** [accepted-residuals-v2.1.0.md](accepted-residuals-v2.1.0.md)  
**Future CTF (Bucket B):** [future-ctf-candidates.md](future-ctf-candidates.md)  
**Secure-ready gate:** [v2.1.0-secure-ready.md](../../../release/v2.1.0-secure-ready.md)  
**CTF evidence (frozen):** branch `ctf/v1.1.0` · tag `v1.1.0`  
**Baseline already on tree:** tag `v2.0.0` (Cycle-1 complete)

| Field | Value |
|-------|-------|
| Cycle | 2 (ADR-013 / ADR-031) |
| From | CTF `v1.1.0` findings (Criticals already closed on secure path) |
| To | Tag **`v2.1.0`** — secure parallel + next-cycle fork point |
| Current milestone | **M4 done** — gate signed; ready to tag `v2.1.0` |
| Code status | Waves A–D **complete** |

```text
v2.0.0 (main) ──► remediation/v2.1.0 ──► tag v2.1.0
                      ▲                      │
ctf/v1.1.0 (frozen) ──┘ findings only        ▼
                                   Cycle-3 Dev picks Bucket B
                                   (fork v2.1.0 → v1.2.0 CTF)
```

---

## Mission

Prove the Cycle-2 attack chain **fails** on the secure stack, close must-close residuals (least-priv DB, LAN-TLS policy, docs hygiene), keep every leftover weakness in Bucket A or B, and tag **`v2.1.0`** as a **secure, expandable fork point** for further CTFs.

This is **not** a second full security-baseline rewrite — Criticals were CTF-only and are already closed on `main`.

**Success** = C2-F01…F07 Verified or Accepted · catalogs signed · journeys green · `tls-smoke` green · [v2.1.0-secure-ready.md](../../../release/v2.1.0-secure-ready.md) signed · tag `v2.1.0` · `ctf/v1.1.0` intact.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Remediation at Cycle-1 depth; Bucket A+B; gate scaffold; cross-links | **Done** |
| **M1** | Wave A — verify Criticals | Ownership / DB role / RS256 / unpublished PG audited; no `CTF_MODE` / CTF compose / CTF seeds on branch | **Done** |
| **M2** | Wave B — regression suite | IDOR deny + forged admin + host `:5433` closed checks named and green | **Done** |
| **M3** | Wave C — residuals | Least-priv `kc_app` live (**must-close**); TLS/LAN docs; auth TTL note; strip stale `// VULN` | **Done** |
| **M4** | Wave D — gate + tag | Secure-ready checkboxes signed; smoke + journey + e2e-docker + **tls-smoke**; merge → tag `v2.1.0` | **Done** (tag/merge when operator asks) |

### M0 — Plan (complete)

- [x] Branch `remediation/v2.1.0` from `main`  
- [x] In-depth [v2.1.0-remediation.md](v2.1.0-remediation.md)  
- [x] Bucket A + Bucket B catalogs  
- [x] [v2.1.0-secure-ready.md](../../../release/v2.1.0-secure-ready.md) scaffold  
- [x] Disposition locked: Criticals = verify; TLS = policy; headers = verify only; least-priv = must-close  

### M1 — Verify (no CTF poison)

- [x] Code walk: ownership, DB role, RS256, unpublished PG  
- [x] Confirm absence of `CTF_MODE` / `docker-compose.ctf.yml` / CTF seed migrations on this branch  
- [x] Stale admin JWT-trust VULN comments removed  
- [x] Existing e2e still green (re-confirmed in M2/M4)  

### M2 — Regression lock

- [x] Explicit Cycle-2 negative tests (`backend/test/cycle-2-regression.e2e-spec.ts`)  
- [x] Host `:5433` closed check (`infra/assert-pg-unpublished.sh` via smoke)  

### M3 — Residuals

- [x] Least-priv DB (`kc_app` DML vs migrator) — **must-close**  
- [x] TLS: document loopback HTTP OK; LAN/recruiter demos → `docker-compose.tls.yml`  
- [x] Headers: checklist only (already in nginx)  
- [x] Auth access-TTL vs refresh cookie operator note (`infra/README.md`)  
- [x] Remove misleading `// VULN` comments on secure controllers  

### M4 — Gate + tag

- [x] Fill and sign `v2.1.0-secure-ready.md`  
- [x] smoke + journey + e2e-docker + tls-smoke  
- [ ] Merge → tag `v2.1.0` (operator)  
- [x] Next CTF forks from that tag only (documented)  

---

## TLS / headers decision (locked)

| Topic | Decision |
|-------|----------|
| Security headers / CSP | **Already done** — verify in gate; no redesign |
| TLS stack | **Already done** (M7 overlay) — keep |
| Day-to-day loopback | HTTP `:8080` → residual **R-01** |
| Off-loopback / LAN secure demo | **TLS required** (docs + operator practice) |
| Force TLS-only compose | **Defer** → residual **R-04** |

---

## Working agreements

| Rule | Practice |
|------|----------|
| Freeze Red evidence | Do not rewrite PoCs or “fix” vulns on `ctf/v1.1.0` |
| No CTF on secure | Secure defaults never enable `CTF_MODE`; no CTF compose on demos meant to stay hardened |
| Closed Criticals stay closed | Do not leave IDOR / weak HS256 / published PG broken on `main` for “CTF convenience” |
| Catalogs required | Every leftover weakness is Bucket A or B — no unmarked gaps |
| Secrets | Env / file mounts; no new hardcoded JWT/DB passwords on secure path |
| Next CTF | Fork tag **`v2.1.0` only**; pick from Bucket B; overlay pattern (ADR-013) |

---

## Test / gate scripts

| Script | Expectation |
|--------|-------------|
| `infra/smoke-test.sh` | Happy path green (HTTP `:8080`) |
| `infra/journey-test.sh` | 3 roles + share + IDOR deny |
| `infra/e2e-docker.sh` | Secure e2e green (incl. Cycle-2 regressions after M2) |
| `infra/tls-smoke.sh` | HTTPS `:8443` + HSTS + Secure cookie (**required pre-tag**) |

---

## Definition of Done (tag `v2.1.0`)

- [x] M0 complete (plan + catalogs)  
- [x] M1–M4 complete  
- [x] Each C2-F01…F07 **Verified**, **Accepted residual**, or **Accepted / keep**  
- [x] Least-priv DB closed (C2-F07) — not silently skipped  
- [x] Bucket A + Bucket B current; no unmarked weaknesses  
- [x] Fork-ready sign-off on gate (product surface intact; next CTF forks this tag)  
- [x] `v2.1.0-secure-ready.md` fully checked  
- [x] smoke + journey + e2e-docker + tls-smoke green  
- [x] `ctf/v1.1.0` left intact  
- [ ] Merge → `main` · tag **`v2.1.0`** (operator)  

---

## Hand-off checklist

- [x] Red writeup accepted as input  
- [x] Branch `remediation/v2.1.0` from `main`  
- [x] M0 disposition signed  
- [x] M1–M4 complete + gate green  
- [ ] Tag `v2.1.0` (operator)  

---

## Next after tag

1. Merge `remediation/v2.1.0` → `main`, tag `v2.1.0`.  
2. Open Cycle-3 Dev: fork tag `v2.1.0` → design **v1.2.0** CTF.  
3. Pick **3–5** candidates from [future-ctf-candidates.md](future-ctf-candidates.md); mark consumed/rejected in that file.  
4. Do **not** reopen closed Cycle-1/2 Criticals on the secure track unless the box story uses an **explicit overlay** on the fork (FC-08).  

---

## Next Build (implement M1+)

```text
On remediation/v2.1.0, implement Blue Team M1–M4 per
docs/security/Cycle-2/Remediation/blue-team-plan.md and
v2.1.0-remediation.md Waves A–D. Do not touch ctf/v1.1.0.
Sign checkboxes in v2.1.0-secure-ready.md when green.
Do not tag/push unless asked.
```

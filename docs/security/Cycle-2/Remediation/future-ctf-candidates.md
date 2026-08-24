# Future CTF candidates (Bucket B)

Surfaces deliberately **deferred** for a later insecure fork. Tag **`v2.1.0`** stays secure; Cycle-3+ Dev picks from this list when designing the next box.

**Policy:**

- Do **not** silently harden a candidate “on main” without updating this file (consumed / rejected).  
- Do **not** weaken closed Cycle-1/2 Criticals on the secure track to “prep” a CTF — use a **fork + overlay** (same pattern as Cycle-2 `CTF_MODE` / `docker-compose.ctf.yml`).  
- Prefer **new** vulnerability classes over replaying the exact Cycle-2 chain unless the story needs FC-08.  
- **No product version bump** for CTF-only work; branches are `ctf/<scenario>`.

**Companion:** [accepted-residuals-v2.1.0.md](accepted-residuals-v2.1.0.md) · [v2.1.0-remediation.md](v2.1.0-remediation.md) · Cycle-3: [../../Cycle-3/README.md](../../Cycle-3/README.md)

**How to use:** For a box plan, pick **3–5** rows, mark status `Consumed (ctf/<scenario>)` or `Rejected`, and link the ground-truth doc.

---

## Candidate table

| ID | Surface | Rough CWE | Suggested box | Fork pattern | Must not regress on secure |
|----|---------|-----------|---------------|--------------|----------------------------|
| **FC-01** | Stored / reflected XSS | 79 | SoftDev notes then CTF | New/rich input + plant on fork | Keep nginx CSP/headers |
| **FC-02** | CSRF on state-changing cookie auth | 352 | later | Weak SameSite / missing CSRF on fork | Keep refresh CSRF header |
| **FC-03** | SSRF via URL fetch | 918 | SoftDev then CTF | New outbound URL on fork only | No open URL fetch on secure `main` |
| **FC-04** | JWT algorithm / key confusion | 347 | mid-chain only | Overlay (HS256/alg confusion) | RS256 fail-closed on secure |
| **FC-05** | Race / TOCTOU | 362 | later | Timing window on fork | — |
| **FC-06** | Cache / edge misconfig | 444 | later | Ops / edge overlay | — |
| **FC-07** | Supply chain / CI secrets | 829 | later | Separate pipeline track | — |
| **FC-08** | Cycle-2-style IDOR / HS256 / published PG | 639 / 347 / 200 | only with **new** story | Overlay — never leave broken on `main` | Ownership, DB-role guard, unpublished PG |
| **FC-09** | Secrets leak via product surface (share plant) | 200 / 538 | **`ctf/leak-crack-db`** | Seeded public share on fork | No world-readable secrets on secure |
| **FC-10** | Crackable lab hash / weak secret | 916 / 521 | **`ctf/leak-crack-db`** | Plant MD5 for John | Secure stays bcrypt cost ≥ 12, strong demo policy |
| **FC-11** | CTF_MODE SQLi (search/filter) | 89 | **`ctf/leak-crack-db`** | String-concat query behind flag | Parameterized queries on secure |
| **FC-12** | Fresh IDOR (non-Cycle-2 object) | 639 | alternate web→DB box | Overlay ownership gap on new story | Ownership stays on secure |
| **FC-13** | Docker / escape / privileged mount | 250 / 552 | later infra chapter | Compose overlay | Hardened prod compose stays |
| **FC-14** | SSH / FTP sidecar | — | later OSCP-flavor | Sidecar on CTF compose only | No SSH/FTP on secure day-to-day |
| **FC-15** | Cloud misconfig / IMDS via SSRF | — | after SoftDev URL fetch | Cloud lab line | — |
| **FC-16** | WordPress / CMS sibling | — | optional parallel lab | Separate compose/repo | Don’t redefine KC as CMS |

---

## Status

| ID | Status |
|----|--------|
| FC-01 … FC-08 | Available (FC-08 = overlay-only; prefer new story) |
| FC-09 · FC-10 · FC-11 | **Consumed (`ctf/leak-crack-db`)** — [ground truth](../../Cycle-3/Dev/v1-leak-crack-db-ground-truth.md) |
| FC-12 … FC-16 | Available (later tracks) |

---

## Closed on secure — not candidates to “leave open”

| Control | Remains on `v2.1.0` |
|---------|---------------------|
| File ownership (C2-F01 / Cycle-1 F-02) | Enforced |
| DB role authorization + RS256 (C2-F02) | Enforced |
| Postgres unpublished on prod compose (C2-F03) | Enforced |
| Share token entropy + expiry | Enforced |
| Swagger gated in prod | Enforced |

---

## Handoff

1. Read [Cycle-3/README.md](../../Cycle-3/README.md).  
2. `git checkout -b ctf/<scenario> v2.1.0`  
3. Box plan / ground truth / player brief under `docs/security/Cycle-3/`.  
4. Implement breaks behind explicit flags/overlays.  
5. Update this status table (`Consumed (ctf/…)`).

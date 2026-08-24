# Future CTF candidates (Bucket B)

Surfaces deliberately **deferred** for a later insecure fork. Tag **`v2.1.0`** stays secure; Cycle-3+ Dev picks from this list when designing the next box.

**Policy:**

- Do **not** silently harden a candidate “on main” without updating this file (consumed / rejected).  
- Do **not** weaken closed Cycle-1/2 Criticals on the secure track to “prep” a CTF — use a **fork + overlay** (same pattern as Cycle-2 `CTF_MODE` / `docker-compose.ctf.yml`).  
- Prefer **new** vulnerability classes over replaying the exact Cycle-2 chain unless the story needs FC-08.

**Companion:** [accepted-residuals-v2.1.0.md](accepted-residuals-v2.1.0.md) (Bucket A) · [v2.1.0-remediation.md](v2.1.0-remediation.md) · [ADR-013](../../../decisions/ADR-013-expansion-cycle-versioning.md)

**How to use:** For Cycle-3 box plan, pick **3–5** rows, mark status `Consumed (v1.2.0)` or `Rejected`, and link the ground-truth doc.

---

| ID | Surface | Rough CWE | Suggested cycle | Fork pattern | Must not regress on secure |
|----|---------|-----------|-----------------|--------------|----------------------------|
| **FC-01** | Stored / reflected XSS | 79 | v1.2.0 | New/rich input + plant on fork | Keep nginx CSP/headers; do not disable for “prep” |
| **FC-02** | CSRF on state-changing cookie auth | 352 | v1.2.0 | Weak SameSite / missing CSRF story on fork | Keep refresh CSRF header (`X-Requested-With`) on secure |
| **FC-03** | SSRF via URL fetch feature | 918 | v1.2.0+ | New outbound URL feature on fork only | Do not add open URL fetch on secure `main` |
| **FC-04** | JWT algorithm / key confusion | 347 | v1.2.0+ | Overlay only (HS256/alg confusion lab) | RS256 fail-closed stays on secure |
| **FC-05** | Race / TOCTOU on shares or approvals | 362 | v1.2.0+ | Timing window on fork | — |
| **FC-06** | Cache / edge misconfig | 444 | later | Ops / edge overlay | — |
| **FC-07** | Supply chain / CI secrets | 829 | later | Separate track (pipeline CTF) | — |
| **FC-08** | Cycle-2-style IDOR / HS256 / published PG | 639 / 347 / 200 | only with new story | **Overlay on fork** — never leave broken on `main` | Ownership, DB-role guard, unpublished PG on secure |

**Status column (maintain below as candidates are used):**

| ID | Status |
|----|--------|
| FC-01 | Available |
| FC-02 | Available |
| FC-03 | Available |
| FC-04 | Available |
| FC-05 | Available |
| FC-06 | Available |
| FC-07 | Available |
| FC-08 | Available (overlay-only; secure path stays hardened) |

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

## Handoff to Cycle-3 Dev

After tag `v2.1.0`:

1. `git checkout -b ctf/v1.2.0 v2.1.0` (or equivalent).  
2. Choose candidates; write box plan / ground truth / player brief under `docs/security/Cycle-3/`.  
3. Implement breaks behind explicit flags/overlays.  
4. Update this file’s status table.

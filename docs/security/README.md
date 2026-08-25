# Security & Penetration Testing

## Cycle workspace

**[Cycle-1/](Cycle-1/README.md)** — **Closed** (v1.0.0 → v2.0.0).

**[Cycle-2/](Cycle-2/README.md)** — **Closed** (v1.1.0 CTF → v2.1.0). Live product = tag **`v2.1.0`** on `main`.

**[Cycle-3/](Cycle-3/README.md)** — **Closed** (`ctf/leak-crack-db` → Blue on `main`). No product version bump ([ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md)).

**[Cycle-4/](Cycle-4/README.md)** — SoftDev **ready on `dev`** (`v1.2.0` → `v2.2.0`): Notes + SSH foothold ([ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md)). Pending merge/tag.

**[Cycle-5/](Cycle-5/README.md)** — **Sketch** (soon after Cycle-4 Blue): shells + PrivEsc on SSH lineage.

| Cycle | Offensive | Defensive (on `main`) |
|-------|-----------|------------------------|
| 1 | [PenTest/v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` | [v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md) · frozen `remediation/v2.0.0` |
| 2 | branch/tag `ctf/v1.1.0` (PenTest/Dev on that branch) | [v2.1.0-remediation.md](Cycle-2/Remediation/v2.1.0-remediation.md) · frozen `remediation/v2.1.0` |
| 3 | branch `ctf/leak-crack-db` (PenTest on that branch) | [cycle-3-leak-crack-db-remediation.md](Cycle-3/Remediation/cycle-3-leak-crack-db-remediation.md) · frozen `remediation/cycle-3-leak-crack-db` |
| 4 | tag `v1.2.0` (SoftDev ship) · Notes XSS + SSH foothold | tag `v2.2.0` (after Red) · [Cycle-4](Cycle-4/README.md) |
| 5 | shells + PrivEsc (sketch) | lab overlay / harden jump host · [Cycle-5](Cycle-5/README.md) |

Legacy redirect: [pentest-cheat-sheet.md](pentest-cheat-sheet.md) → ground truth

## Cross-cycle references

- [cwe-inventory.md](cwe-inventory.md) — 59 instances / 38 CWE IDs (v1.0.0 baseline)
- [pentest-journeys.md](../deploy/pentest-journeys.md) — narrative exploit paths (v1.0.0)
- [demo-users.md](../deploy/demo-users.md) — credentials and seeded artifact IDs
- [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md) — Cycle-1 Red gate (**passed**)
- [v2.0.0-secure-ready.md](../release/v2.0.0-secure-ready.md) — Cycle-1 Blue gate (**signed**)
- [v1.1.0-ctf-ready.md](../release/v1.1.0-ctf-ready.md) — Cycle-2 CTF gate
- [v2.1.0-secure-ready.md](../release/v2.1.0-secure-ready.md) — Cycle-2 Blue gate (**signed**)
- [cycle-3-leak-crack-db-secure-ready.md](../release/cycle-3-leak-crack-db-secure-ready.md) — Cycle-3 Blue gate (**signed**)
- [v1.2.0-pentest-ready.md](../release/v1.2.0-pentest-ready.md) — Cycle-4 SoftDev Red gate (**unsigned until merge/tag**)
- [security-baseline.md](../spec/security-baseline.md) — secure-product control checklist
- [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) — CTF-only cycles without product version bumps
- [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md) — SoftDev Cycle-4 pair `v1.2.0`→`v2.2.0`

## Scope

Cycles 1–3 complete. SoftDev tip = intentional **`v1.2.0`** (Notes + SSH). Last hardened product tag = **`v2.1.0`**. After Red → Blue **`v2.2.0`**; then Cycle-5 shells/PrivEsc.
## Tools

- Burp Suite / OWASP ZAP (HTTP proxy)
- curl / httpx (API probing)
- jwt_tool (against intentional CTF/insecure tags — not expected to forge roles on hardened `main`)
- Docker compose stack (`infra/docker-compose.prod.yml`; CTF overlay only on `ctf/*`)

## Entry points (SoftDev tip / `v1.2.0`)

| Surface | URL / path | Auth |
|---------|------------|------|
| App UI | `http://localhost:8080` | Browser; access JWT in memory + httpOnly refresh cookie |
| Notes UI | `/notes`, `/notes/[id]` | Auth; XSS sinks intentional on this tip |
| API (proxied) | `http://localhost:8080/api/*` | Bearer access JWT |
| Notes API | `/api/notes` | Owner / mod / admin per route |
| SSH (overlay) | host `:2222` → user `lab` | Password from Notes chain |
| OpenAPI | Dev / lab only (disabled in production unless flagged) | — |
| Public share | `GET /api/sharing/public/:token` | Token |
| API explorers | `/dev/*` | Lab flag gated in prod |

Pin tag **`v2.1.0`** for hardened demos until **`v2.2.0`**.

## Methodology (against historical / CTF / SoftDev insecure tips)

Run offensive work against **tag `v1.0.0`**, **`ctf/v1.1.0`**, **`ctf/leak-crack-db`**, or SoftDev **`v1.2.0`** — not as expectations against hardened tags (`v2.1.0` / future `v2.2.0`):

1. Verify deploy: smoke / journey / e2e; for Cycle-4 also `cycle4-ssh-examiner.sh`
2. Map attack surface from that cycle’s ground truth
3. Authenticate as user, moderator, admin; test Notes + legacy IDOR paths as documented
4. Document findings in the cycle PenTest writeup

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [ADR-031](../decisions/ADR-031-security-cycle-docs.md)
- [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md) · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) · [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md)

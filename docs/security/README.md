# Security & Penetration Testing

## Cycle workspace

**[Cycle-1/](Cycle-1/README.md)** — **Closed** (v1.0.0 → v2.0.0).

**[Cycle-2/](Cycle-2/README.md)** — **Closed** (v1.1.0 CTF → v2.1.0).

**[Cycle-3/](Cycle-3/README.md)** — **Closed** (`ctf/leak-crack-db` → Blue on `main`). No product version bump ([ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md)).

**[Cycle-4/](Cycle-4/README.md)** — **Closed** (`v1.2.0` → `v2.2.0`): Notes hardened; no default SSH ([ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md)).

**[Cycle-5/](Cycle-5/README.md)** — **Closed** (`ctf/shells-privesc` → Blue on `main`, no version bump). [secure-ready](../release/shells-privesc-secure-ready.md).

**[Cycle-6/](Cycle-6/README.md)** — **Closed** (`v1.3.0` → `v2.3.0`): Preview destination policy + bookmark CSRF ([ADR-034](../decisions/ADR-034-cycle-6-product-expansion-pair.md)). [secure-ready](../release/v2.3.0-secure-ready.md).

**[Cycle-7/](Cycle-7/README.md)** — **Closed** (`v1.4.0` → `v2.4.0`): Ops Documents path confinement + overlays unpublished ([ADR-035](../decisions/ADR-035-cycle-7-multi-service-pair.md)). [secure-ready](../release/v2.4.0-secure-ready.md).

| Cycle | Offensive | Defensive (on `main`) |
|-------|-----------|------------------------|
| 1 | [PenTest/v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` | [v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md) · frozen `remediation/v2.0.0` |
| 2 | branch/tag `ctf/v1.1.0` (PenTest/Dev on that branch) | [v2.1.0-remediation.md](Cycle-2/Remediation/v2.1.0-remediation.md) · frozen `remediation/v2.1.0` |
| 3 | branch `ctf/leak-crack-db` (PenTest on that branch) | [cycle-3-leak-crack-db-remediation.md](Cycle-3/Remediation/cycle-3-leak-crack-db-remediation.md) · frozen `remediation/cycle-3-leak-crack-db` |
| 4 | tag/`ctf/v1.2.0` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.2.0/docs/security/Cycle-4/PenTest/v1.2.0-writeup.md) | tag **`v2.2.0`** · [blue-team-plan](Cycle-4/Remediation/blue-team-plan.md) · frozen `remediation/v2.2.0` |
| 5 | `ctf/shells-privesc` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md) | [Remediation/](Cycle-5/Remediation/) · frozen `remediation/shells-privesc` |
| 6 | tag/`ctf/v1.3.0` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md) | tag **`v2.3.0`** · [Remediation/](Cycle-6/Remediation/) · frozen `remediation/v2.3.0` |
| 7 | tag/`ctf/v1.4.0` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md) | tag **`v2.4.0`** · [Remediation/](Cycle-7/Remediation/) · frozen `remediation/v2.4.0` |

Legacy redirect: [pentest-cheat-sheet.md](pentest-cheat-sheet.md) → ground truth

## Playable boxes (frozen archives)

Checkout the branch, follow the player brief, don’t use for “secure” demos.

| Box | Branch | Skills | Start |
|-----|--------|--------|-------|
| Cycle-2 | `ctf/v1.1.0` | IDOR / JWT / PG | tag or branch README |
| Cycle-3 | `ctf/leak-crack-db` | leak → crack → SQLi → DB | [Cycle-3](Cycle-3/README.md) |
| Cycle-4 | `ctf/v1.2.0` | Notes XSS → SSH foothold | [Cycle-4](Cycle-4/README.md) |
| Cycle-5 | `ctf/shells-privesc` | cmdi → revshell → sudo PrivEsc | [Cycle-5](Cycle-5/README.md) |
| Cycle-6 | `ctf/v1.3.0` | Preview SSRF + bookmark CSRF | [Cycle-6](Cycle-6/README.md) |
| Cycle-7 | `ctf/v1.4.0` | LFI + FTP/SSH/Cowrie/jump | [Cycle-7](Cycle-7/README.md) |

## Branch keepers (tip hygiene)

| Keep | Role |
|------|------|
| `main` | Secure tip |
| `backend` / `frontend` / `dev` | Feature lanes (reset at product-expansion cycle start) |
| `ctf/*` | Forever CTF archives (play / evidence) |
| `remediation/*` | Forever Blue archives |

Delete merged one-off hotfixes when done (e.g. `hotfix/*` after merge). Don’t prune `ctf/*` or feature lanes to “reduce branch count.”

## Cross-cycle references

- [cwe-inventory.md](cwe-inventory.md) — 59 instances / 38 CWE IDs (v1.0.0 baseline) + Cycle-4 XSS pointer
- [pentest-journeys.md](../deploy/pentest-journeys.md) — narrative exploit paths (v1.0.0)
- [demo-users.md](../deploy/demo-users.md) — credentials and seeded artifact IDs
- [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md) — Cycle-1 Red gate (**passed**)
- [v2.0.0-secure-ready.md](../release/v2.0.0-secure-ready.md) — Cycle-1 Blue gate (**signed**)
- [v1.1.0-ctf-ready.md](../release/v1.1.0-ctf-ready.md) — Cycle-2 CTF gate
- [v2.1.0-secure-ready.md](../release/v2.1.0-secure-ready.md) — Cycle-2 Blue gate (**signed**)
- [cycle-3-leak-crack-db-secure-ready.md](../release/cycle-3-leak-crack-db-secure-ready.md) — Cycle-3 Blue gate (**signed**)
- [v1.2.0-pentest-ready.md](../release/v1.2.0-pentest-ready.md) — Cycle-4 expansion Red gate (**signed** · tag `v1.2.0`)
- [v2.2.0-secure-ready.md](../release/v2.2.0-secure-ready.md) — Cycle-4 Blue gate (**signed** · tag `v2.2.0`)
- [shells-privesc-ctf-ready.md](../release/shells-privesc-ctf-ready.md) — Cycle-5 Red/CTF gate (**on CTF branch** · frozen)
- [v1.3.0-pentest-ready.md](../release/v1.3.0-pentest-ready.md) — Cycle-6 expansion Red gate (**signed** · tag `v1.3.0`)
- [v2.3.0-secure-ready.md](../release/v2.3.0-secure-ready.md) — Cycle-6 Blue gate (**signed** · tag `v2.3.0`)
- [v1.4.0-pentest-ready.md](../release/v1.4.0-pentest-ready.md) — Cycle-7 expansion Red gate (**signed** · tag `v1.4.0`)
- [v2.4.0-secure-ready.md](../release/v2.4.0-secure-ready.md) — Cycle-7 Blue gate (**signed** · tag `v2.4.0`)
- [security-baseline.md](../spec/security-baseline.md) — secure-product control checklist
- [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) — CTF-only cycles without product version bumps
- [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md) — Cycle-4 pair `v1.2.0`→`v2.2.0`
- [ADR-034](../decisions/ADR-034-cycle-6-product-expansion-pair.md) — Cycle-6 pair `v1.3.0`→`v2.3.0`
- [ADR-035](../decisions/ADR-035-cycle-7-multi-service-pair.md) — Cycle-7 pair `v1.4.0`→`v2.4.0`

## Scope

Cycles **1–7 complete**. Tip on `main` is hardened **`v2.4.0`**. Play boxes: frozen `ctf/*` above.

## Tools

- Burp Suite / OWASP ZAP (HTTP proxy)
- curl / httpx (API probing)
- jwt_tool (against intentional CTF/insecure tags — not expected to forge roles on hardened `main`)
- Docker compose stack (`infra/docker-compose.prod.yml`; SSH overlay only for `v1.2.0` / `ctf/v1.2.0` replay; Cycle-7 overlays only on `ctf/v1.4.0`)

## Entry points (secure tip / `v2.4.0`)

| Surface | URL / path | Auth |
|---------|------------|------|
| App UI | `http://localhost:8080` (TLS demo `:8443`) | Browser; access JWT in memory + httpOnly refresh cookie |
| Notes UI | `/notes`, `/notes/[id]` | Auth; body is plain text (escaped) |
| Link Preview | `/preview` | Auth; server fetch with destination policy |
| Ops Documents | `/ops` | Auth; path-confined handbook read |
| API (proxied) | `http://localhost:8080/api/*` | Bearer access JWT |
| Notes API | `/api/notes` | Owner / mod / admin per route |
| Preview API | `POST /api/preview` | Bearer; throttled |
| Ops API | `GET /api/ops/documents?path=` | Bearer; confined under library root |
| Bookmarks | `/api/auth/bookmarks` | Refresh cookie + CSRF header |
| OpenAPI | Dev / lab only (disabled in production unless flagged) | — |
| Public share | `GET /api/sharing/public/:token` | Token |
| API explorers | `/dev/*` | Lab flag gated in prod |

Pin tag **`v2.4.0`** for hardened demos. Replay Cycle-7 plants on **`v1.4.0`** / **`ctf/v1.4.0`** + `docker-compose.cycle7.yml`. Replay Preview plants on **`v1.3.0`** / **`ctf/v1.3.0`**. Replay Notes+SSH on **`v1.2.0`** / **`ctf/v1.2.0`** + `docker-compose.ssh.yml` only.

## Methodology (against historical / CTF / insecure tips)

Run offensive work against **tag `v1.0.0`**, **`ctf/v1.1.0`**, **`ctf/leak-crack-db`**, SoftDev **`v1.2.0`** / **`ctf/v1.2.0`**, Cycle-6 **`v1.3.0`** / **`ctf/v1.3.0`**, or Cycle-7 **`v1.4.0`** / **`ctf/v1.4.0`** — not as expectations against hardened tip **`v2.4.0`**:

1. Verify deploy: smoke / journey / e2e; Cycle-6/7 Blue also `cycle6-blue-assert.sh` / `cycle7-blue-assert.sh`
2. Map attack surface from that cycle’s ground truth
3. Authenticate; exercise the cycle’s surfaces
4. Document findings in the cycle PenTest writeup (on the CTF / insecure branch)

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [ADR-031](../decisions/ADR-031-security-cycle-docs.md)
- [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md) · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) · [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md) · [ADR-034](../decisions/ADR-034-cycle-6-product-expansion-pair.md) · [ADR-035](../decisions/ADR-035-cycle-7-multi-service-pair.md)

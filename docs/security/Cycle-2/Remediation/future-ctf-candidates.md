# Future CTF candidates (Bucket B)

Surfaces deliberately **deferred** for a later insecure fork. Tag **`v2.1.0`** stays secure; Cycle-3+ Dev picks from this list when designing the next box.

**Policy:**

- Do **not** silently harden a candidate “on main” without updating this file (consumed / rejected).  
- Do **not** weaken closed Cycle-1/2 Criticals on the secure track to “prep” a CTF — use a **fork + overlay**.  
- Prefer **new** vulnerability classes over replaying the exact Cycle-2 chain unless the story needs FC-08.  
- **No product version bump** for CTF-only work ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md)); branches are `ctf/<scenario>`.

**Companion:** [accepted-residuals-v2.1.0.md](accepted-residuals-v2.1.0.md) · [v2.1.0-remediation.md](v2.1.0-remediation.md) · Cycle-4: [../../Cycle-4/README.md](../../Cycle-4/README.md)

---

## Candidate table

| ID | Surface | Rough CWE | Suggested box | Fork pattern | Must not regress on secure |
|----|---------|-----------|---------------|--------------|----------------------------|
| **FC-01** | Stored / reflected XSS | 79 | **Cycle-4 Notes (`v1.2.0`)** | SoftDev notes body XSS on insecure | Keep nginx CSP/headers; sanitize on `v2.2.0` |
| **FC-02** | CSRF on state-changing cookie auth | 352 | **Cycle-6 `v1.3.0` / `v2.3.0`** | Weak SameSite / missing CSRF on expansion tip | Keep refresh + bookmark CSRF on hardened tip |
| **FC-03** | SSRF via URL fetch | 918 | **Cycle-6 `v1.3.0` / `v2.3.0`** | Link Preview open fetch on expansion tip | Destination policy on secure `main` |
| **FC-04** | JWT algorithm / key confusion | 347 | mid-chain only | Overlay (HS256/alg confusion) | RS256 fail-closed on secure |
| **FC-05** | Race / TOCTOU | 362 | later | Timing window on fork | — |
| **FC-06** | Cache / edge misconfig | 444 | later | Ops / edge overlay | — |
| **FC-07** | Supply chain / CI secrets | 829 | later | Separate pipeline track | — |
| **FC-08** | Cycle-2-style IDOR / HS256 / published PG | 639 / 347 / 200 | only with **new** story | Overlay — never leave broken on `main` | Ownership, DB-role guard, unpublished PG |
| **FC-09** | Secrets leak via product surface (share plant) | 200 / 538 | **`ctf/leak-crack-db`** | Seeded public share on fork | No world-readable secrets on secure |
| **FC-10** | Crackable lab hash / weak secret | 916 / 521 | **`ctf/leak-crack-db`** | Plant MD5 for John | Secure stays bcrypt cost ≥ 12, strong demo policy |
| **FC-11** | CTF_MODE SQLi (search/filter) | 89 | **`ctf/leak-crack-db`** | String-concat query behind flag | Parameterized queries / no `q` concat on secure |
| **FC-12** | Fresh IDOR (non-Cycle-2 object) | 639 | alternate web→DB box | Overlay ownership gap on new story | Ownership stays on secure |
| **FC-13** | Docker / escape / privileged mount | 250 / 552 | Cycle-5 adjacent / later | Compose overlay | Hardened prod compose stays |
| **FC-14** | SSH / FTP sidecar | — | **C4 SSH**; **C5** shells; **Cycle-7 FTP** | Overlay insecure/CTF only | No SSH/FTP on secure day-to-day |
| **FC-15** | Cloud misconfig / IMDS via SSRF | — | after Cycle-6 URL fetch | Cloud lab line | — |
| **FC-16** | WordPress / CMS sibling | — | optional parallel lab | Separate compose/repo | Don’t redefine KC as CMS |
| **FC-17** | Useless config leak (OSCP-inspired `.env`) | 200 / 538 | Cycle-7 optional FTP decoy | Loopback DB_* / decoy; remote mysql fails | No world-readable secrets on secure tip |
| **FC-18** | LFI / arbitrary file read → config | 22 / 200 | **Cycle-7 `v1.4.0`** | Ops Documents path param | Path checks stay on secure tip |
| **FC-19** | FastAPI Intake SQLi + mail hash users (microservice behind Nest) | 89 / 916 | **Cycle-8 `v1.5.0`** | Intake via `/api/intake` + lab-weak SMTP hashes | Parameterized queries; no weak hash plant on secure tip |
| **FC-20** | Cowrie-only SSH + LIVE weak FTP + Samba/SMTP dual-home | — | **Cycle-8 `v1.5.0`** | `docker-compose.cycle8.yml` overlays | Unpublished on default prod |

---

## Status

| ID | Status |
|----|--------|
| FC-01 · FC-14 (SSH foothold) | **Consumed (Cycle-4 `v1.2.0` / `v2.2.0`)** |
| FC-14 (shells/PrivEsc) | **Consumed (Cycle-5 `ctf/shells-privesc`)** — Blue on `main` · optional SSH noise kept |
| FC-13 | Later (not Cycle-5) |
| FC-02 · FC-03 | **Consumed (Cycle-6 `v1.3.0` / `v2.3.0`)** — Red on `ctf/v1.3.0`; Blue `remediation/v2.3.0` |
| FC-04 … FC-08 | Available (FC-08 = overlay-only; prefer new story) |
| FC-09 · FC-10 · FC-11 | **Consumed (`ctf/leak-crack-db`)** — Cycle-3 closed; Blue on `main` |
| FC-12 · FC-15 · FC-16 | Available (later tracks) |
| FC-14 (FTP) · FC-18 | **Consumed (Cycle-7 `v1.4.0` / `v2.4.0`)** — Red frozen `ctf/v1.4.0`; Blue tagged `v2.4.0` |
| FC-17 | Optional decoy on Cycle-7 (not graded DoD) |
| FC-19 · FC-20 | **Planned (Cycle-8 `v1.5.0` / `v2.5.0`)** — P0 design; build from tip `v2.4.0` |

---

## Closed on secure — not candidates to “leave open”

| Control | Remains on `v2.1.0` |
|---------|---------------------|
| File ownership (C2-F01 / Cycle-1 F-02) | Enforced |
| DB role authorization + RS256 (C2-F02) | Enforced |
| Postgres unpublished on prod compose (C2-F03) | Enforced |
| Share token entropy + expiry | Enforced |
| Swagger gated in prod | Enforced |
| No CTF_MODE / files `q` concat (C3-F02) | Enforced |
| No ops MD5 plant on secure (C3-F01) | Enforced |

---

## Handoff

1. Cycle-7 **closed** (`v1.4.0` / `ctf/v1.4.0` → `v2.4.0`) — [Cycle-7](../../Cycle-7/README.md).  
2. Cycle-8 P0 → PR → `main` ([Cycle-8](../../Cycle-8/README.md) · [ADR-036](../../../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md)).  
3. Feature lanes → tip `v1.5.0` → Red → Blue `v2.5.0`.  
4. For CTF-only boxes: `git checkout -b ctf/<scenario>` (ADR-032).  
5. Update this status table (`Consumed` / `Planned` / `In progress`).

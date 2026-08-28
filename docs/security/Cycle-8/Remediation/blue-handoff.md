# Blue handoff — Cycle-8 (`v1.5.0` → `v2.5.0`)

**Audience:** Blue players after Red finished the Cycle-8 tip.  
**Source:** Red findings (confirmed) + codebase guidance.  
**Not included:** exploit steps, flag values, final patches.

Start from the insecure pin Red attacked:

```bash
git checkout -b blue/cycle-8 v1.5.0
# work on remediation/v2.5.0 from main — see blue-team-plan.md
```

**`[SPOILER]`** after you finish (or if stuck): tag `v2.5.0` · [v2.5.0-remediation.md](v2.5.0-remediation.md) · [full Red writeup](../PenTest/v1.5.0-writeup.md) on branch **`ctf/v1.5.0`**

---

## Ticket (must-close)

| ID | Severity | CWE | OWASP 2025 | Title | Where to look | Success when |
|----|----------|-----|------------|-------|---------------|--------------|
| **C8-F01** | Critical | 89 | A05 Injection | Intake SQLi on `/api/intake/search` | `intake/` FastAPI service; nginx `/api/intake/` proxy; seed `intake/seed/seed.sql` | Parameterized queries; no UNION dump; F1 / `mail_users` plant absent from tip responses |
| **C8-F02** | High | 521, 307 | A07 Authentication Failures | Weak FTP credentials (`lisa`/rockyou-class password) | `infra/cycle8/ftp/`, `docker-compose.cycle8.yml` | No weak LIVE FTP on secure tip; `:21` unpublished on default prod |
| **C8-F03** | Critical | 434, 94 | A06 Insecure Design | FTP `www/` write → PHP RCE in `/www/` | FTP home + `nginx-cycle8.conf` `/www/`; edge PHP runtime | Upload tree separated from executable docroot; no webshell path on secure tip |
| **C8-F04** | High | 269 | A02 Security Misconfiguration | `ops` NOPASSWD `sudo /usr/bin/nano` | `infra/cycle8/edge/` sudoers / Dockerfile | No shell PrivEsc plant on secure tip |
| **C8-F05** | High | 284, 1392 | A01 Broken Access Control | Internal Samba reachable from edge + cred reuse | `infra/cycle8/samba/`, compose internal network; edge dual-home | Samba/mail overlays unpublished from Kali; no F5 plant on secure tip; segmentation or overlay off default prod |

## Observed / residual (not a graded Blue fail)

| ID | Severity | Title | Note |
|----|----------|-------|------|
| **C8-F06** | Info | Cowrie `:22` decoy | Archive realism on `ctf/v1.5.0` only once overlays unpublished on prod |
| **C8-F07** | Low | Intake decoy “legacy FTP” API panel | Remove or clearly label non-production; fails on live FTP today |

---

## Scope reminders

- Do **not** re-break Cycle-6 Preview SSRF / bookmark CSRF or Notes XSS or Cycle-7 Ops path confinement.
- Overlay `docker-compose.cycle8.yml` may remain for **`ctf/v1.5.0` replay**; it must not be required for secure day-to-day prod.
- **Northwind skin kept** on `v2.5.0` ([ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)).
- Tip UI / version string on hardened product → **`v2.5.0`**.
- Per P0: **delete tip overlay plant copies** from secure path where they would ship on default images (archive stays on `ctf/v1.5.0`).

---

## Verification (target)

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/assert-cycle8-unpublished.sh
./infra/assert-pg-unpublished.sh
./infra/smoke-test.sh && ./infra/journey-test.sh
./infra/cycle6-blue-assert.sh && ./infra/cycle7-blue-assert.sh
# + cycle8 blue assert when added (M3)
./infra/cycle8-blue-assert.sh
```

TLS profile + `tls-smoke.sh` required at secure-ready gate (inherit Cycle-6/7).

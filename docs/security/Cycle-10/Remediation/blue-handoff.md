# Blue handoff — Cycle-10 (`v1.10.0` → `v2.10.0`)

**Audience:** Blue after Red froze Cycle-10 tip.  
**Source:** Red findings (confirmed 3/3) + plant markers in tree.  
**Not included:** exploit steps, flag values, finished patches (fill [v2.10.0-remediation.md](v2.10.0-remediation.md) as you close).

```bash
git checkout remediation/v2.10.0   # already cut from tag v1.10.0 + SoftDev B2 bastion plant
# plan: blue-team-plan.md · map: v2.10.0-remediation.md
```

**Active branch:** `remediation/v2.10.0`  
**`[SPOILER]`** after finish (or stuck): tag `v2.10.0` · [v2.10.0-remediation.md](v2.10.0-remediation.md) · full Red writeup on **`ctf/v1.10.0`** → `docs/security/Cycle-10/PenTest/v1.10.0-writeup.md`

---

## Ticket (must-close)

| ID | Severity | CWE | OWASP 2025 | Title | Where to look | Success when |
|----|----------|-----|------------|-------|---------------|--------------|
| **C10-F01** | High | 269 | A01 Broken Access Control | Public staff-access → moderator | `backend/src/packets/access-requests.service.ts`, `frontend/app/staff-access/` | No public self-elevation; form gone or ticket/approval flow; role stays `user` until admin |
| **C10-F02** | Critical | 78 | A03 Injection | Packet `originalName` → helper shell | `backend/src/packets/packets.service.ts` `callHelper`, `infra/cycle10/docproc/helper.py` | Encode/allowlist name; helper never `shell=True`; RCE gone |
| **C10-F03** | High | 250 / 78 | A05 Security Misconfiguration | `sudo find` PrivEsc on docproc | `infra/cycle10/docproc/Dockerfile`, `entrypoint.sh` | No sudoers for docuser; non-root container; `/root/*` proofs unpublished |
| **C10-F04** | High | 200 / 522 | A02 / A07 | Archive DB credential + `northwind_archive` loot | `infra/cycle10/db-archive/`, docproc dual-home / DATA reachability, seed notes | Strong unique secrets; no plaintext creds in schema/notes; archive not dual-homed to APP or locked down |
| **C10-F05** | Critical | 269 / 522 | A07 Identification Failures | Bastion password reuse + `sudo ALL` | `infra/cycle10/bastion/Dockerfile`, docproc `/root/bastion.secret`, integrate SSH path | No shared Welcome1; no `nwadmin ALL=(ALL)`; crown unpublished; bastion keys/MFA or broken plant |

**Red freeze:** 2026-11-16 — local.txt · proof.txt · crown.txt on `ctf/v1.10.0` (`bcea290`). SoftDev B2 Option A: bastion `sudo` PASSWD + Welcome1 reuse (not free `chmod`).

## Scope reminders

- Do **not** re-break Cycle-6 Preview SSRF / bookmark CSRF, Notes XSS, Cycle-7 Ops LFI, Cycle-8 Intake SQLi, Cycle-9 Intake IDOR / BFF hop / export PT.
- Edge **sole HostPort `:443`** stays (ADR-039). Do not publish APP/DATA/CORP/MGMT ports.
- Summer2024 sticky / decoy paths stay noise or get deleted — never become the real secret.
- Do **not** merge `ctf/v1.10.0` into `main` / this branch.

## Tip hygiene (ship gate)

- Strip graded `OS{…}` from tip images and seeds.
- Tip / UI version string → **`v2.10.0`**.
- Remove `CYCLE10-PLANT` markers or replace with secure comments.
- [accepted-residuals.md](accepted-residuals.md) must stay **empty** at ship (ADR-039 zero residuals).

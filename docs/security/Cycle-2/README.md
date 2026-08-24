# Security Cycle 2 (v1.1.0 → v2.1.0)

**Status:** Red Team **complete** · Box **frozen** on `ctf/v1.1.0` · Blue Team **merged** · tag **`v2.1.0`** on `main`

Cycle 2 is an **OSCP-style CTF box** forked from secure tag **`v2.0.0`**.  
Short chain (not Cycle-1 kitchen-sink). Scoring = **identity + 32-char hex flag** at three tiers.

| Version | Role | Status |
|---------|------|--------|
| v2.0.0 | Secure fork point | Tagged |
| **v1.1.0** | CTF / insecure scenario | **Shipped** — branch + tag `v1.1.0` (replayable) |
| v1.1.x | PenTest writeup | **Complete** — on `ctf/v1.1.0` |
| **v2.1.0** | Secure parallel | **Tagged** on `main` · frozen `remediation/v2.1.0` |

Future CTFs follow [ADR-032](../../decisions/ADR-032-post-v2.1.0-versioning.md): misconfigure **current** product version (**no** new `v1.N.0` / `v2.N.0` product tags). Candidates: [Remediation/future-ctf-candidates.md](Remediation/future-ctf-candidates.md).

---

## Portfolio paths (pick one)

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player / recruiter try-the-box** | checkout `ctf/v1.1.0` → Dev player brief → deploy below | No |
| **Read the engagement** | checkout `ctf/v1.1.0` → PenTest writeup | Yes (full chain) |
| **Build / examine the box** | checkout `ctf/v1.1.0` → Dev ground truth / box plan | Yes |
| **Blue Team (done)** | [Remediation/](Remediation/) on `main` · [v2.1.0-remediation.md](Remediation/v2.1.0-remediation.md) · [secure-ready](../../release/v2.1.0-secure-ready.md) | Yes |

> **Note:** `Dev/` and `PenTest/` trees for Cycle-2 live on branch/tag **`ctf/v1.1.0`**, not on `main`. Remediation docs are on `main`.

Gate document: [v1.1.0-ctf-ready.md](../../release/v1.1.0-ctf-ready.md)

---

## Deploy the replayable box

```bash
git checkout ctf/v1.1.0   # or tag v1.1.0
cd infra
cp .env.example .env
# Set DB_PASSWORD=KcCtfDbPr0of2026! (must match plant — see ground truth on this branch)
docker compose -f docker-compose.prod.yml -f docker-compose.ctf.yml up -d --build
./ctf-examiner.sh         # optional operator dry-run (spoilers)
```

- App: `http://localhost:8080` (or host LAN IP from Kali)  
- Postgres published: `:5433` (creds **not** default — gated behind chain)  
- **Never** use the CTF overlay on a secure/demo path meant to stay hardened

Details: [infra/README.md](../../../infra/README.md)

---

## Team workspaces

| Folder | Purpose | Where |
|--------|---------|-------|
| Dev/ | Box plan, ground truth, player brief | `ctf/v1.1.0` |
| PenTest/ | Scope, notes, screenshots, full writeup | `ctf/v1.1.0` |
| [Remediation/](Remediation/) | Fix map, residuals, CTF candidates, Blue plan | `main` (+ frozen `remediation/v2.1.0`) |

---

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Release gate | [../../release/v1.1.0-ctf-ready.md](../../release/v1.1.0-ctf-ready.md) | Ready |
| Remediation map | [Remediation/v2.1.0-remediation.md](Remediation/v2.1.0-remediation.md) | Complete on `main` |
| Residuals (Bucket A) | [Remediation/accepted-residuals-v2.1.0.md](Remediation/accepted-residuals-v2.1.0.md) | Signed |
| Future CTF (Bucket B) | [Remediation/future-ctf-candidates.md](Remediation/future-ctf-candidates.md) | Handoff |
| Secure-ready gate | [../../release/v2.1.0-secure-ready.md](../../release/v2.1.0-secure-ready.md) | **Signed** (2026-08-24) |
| Box plan / ground truth / writeup | on `ctf/v1.1.0` under `docs/security/Cycle-2/` | Frozen |

---

## Branch / tags

| Ref | Purpose | Policy |
|-----|---------|--------|
| tag `v2.0.0` | Secure fork point | Historical |
| **`ctf/v1.1.0`** / tag **`v1.1.0`** | Replayable CTF + Red artifacts | **Freeze** |
| **`remediation/v2.1.0`** | Frozen Blue implementation history | **Freeze** |
| tag **`v2.1.0`** | Secure product on `main` | Current |

---

## Rules (Cycle-2)

- **No new product routes** — misconfigure + plant flags only.
- **OSCP proof culture** — identity (`whoami` analogue) **and** flag body.
- Flags = **32-char hex** (`local.txt` / `proof.txt` / `ctf_flag`).
- **DB admin-gated** — nmap may see Postgres; creds after admin loot.
- **SSH/FTP** — out of scope for v1.1.0.

---

## References

- [CTF exam methodologies](../ctf-methodologies.md)
- [ADR-013](../../decisions/ADR-013-expansion-cycle-versioning.md) · [ADR-032](../../decisions/ADR-032-post-v2.1.0-versioning.md) · [ADR-031](../../decisions/ADR-031-security-cycle-docs.md)
- Cycle-1 (closed): [../Cycle-1/README.md](../Cycle-1/README.md)

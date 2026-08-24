# Security Cycle 2 (v1.1.0 → v2.1.0)

**Status:** Red Team **complete** · Box **frozen** on branch `ctf/v1.1.0` (replayable forever) · Blue Team (`v2.1.0`) next on a separate branch from `main`

Cycle 2 is an **OSCP-style CTF box** forked from secure tag **`v2.0.0`**.  
Short chain (not Cycle-1 kitchen-sink). Scoring = **identity + 32-char hex flag** at three tiers.

| Version | Role | Status |
|---------|------|--------|
| v2.0.0 | Secure fork point | Tagged on `main` |
| **v1.1.0** | CTF / insecure scenario | **Shipped** — branch + tag `v1.1.0` (replayable) |
| v1.1.x | PenTest writeup | **Complete** — [PenTest/v1.1.0-writeup.md](PenTest/v1.1.0-writeup.md) |
| v2.1.0 | Secure parallel | **Planned** — [Remediation/](Remediation/) from `main`, not from this CTF branch |

---

## Portfolio paths (pick one)

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player / recruiter try-the-box** | [Dev/v1.1.0-player-brief.md](Dev/v1.1.0-player-brief.md) → deploy below | No |
| **Read the engagement** | [PenTest/v1.1.0-writeup.md](PenTest/v1.1.0-writeup.md) | Yes (full chain) |
| **Build / examine the box** | [Dev/v1.1.0-ground-truth.md](Dev/v1.1.0-ground-truth.md) · [box plan](Dev/v1.1.0-box-plan.md) | Yes |
| **Blue Team next** | [Remediation/v2.1.0-remediation.md](Remediation/v2.1.0-remediation.md) | Yes |

Gate document: [v1.1.0-ctf-ready.md](../../release/v1.1.0-ctf-ready.md)

---

## Deploy the replayable box

```bash
git checkout ctf/v1.1.0   # or tag v1.1.0 after it exists
cd infra
cp .env.example .env
# Set DB_PASSWORD=KcCtfDbPr0of2026! (must match plant — see ground truth)
docker compose -f docker-compose.prod.yml -f docker-compose.ctf.yml up -d --build
./ctf-examiner.sh         # optional operator dry-run (spoilers)
```

- App: `http://localhost:8080` (or host LAN IP from Kali)  
- Postgres published: `:5433` (creds **not** default — gated behind chain)  
- **Never** use the CTF overlay on a secure/demo path meant to stay hardened

Details: [infra/README.md](../../../infra/README.md) · [PenTest/scope.md](PenTest/scope.md)

---

## Team workspaces

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Box plan, ground truth, player brief |
| [PenTest/](PenTest/) | Scope, notes, screenshots, full writeup |
| [Remediation/](Remediation/) | Finding → fix map for `v2.1.0` (implement off `main`) |

---

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Release gate | [../../release/v1.1.0-ctf-ready.md](../../release/v1.1.0-ctf-ready.md) | **Ready** |
| Box plan | [Dev/v1.1.0-box-plan.md](Dev/v1.1.0-box-plan.md) | Locked / implemented |
| Ground truth | [Dev/v1.1.0-ground-truth.md](Dev/v1.1.0-ground-truth.md) | Complete (spoilers) |
| Player brief | [Dev/v1.1.0-player-brief.md](Dev/v1.1.0-player-brief.md) | Complete (no spoilers) |
| Writeup | [PenTest/v1.1.0-writeup.md](PenTest/v1.1.0-writeup.md) | **Final** (PTES / OWASP / OSCP / HTB-sample) |
| Scope | [PenTest/scope.md](PenTest/scope.md) | Locked |
| Evidence | [PenTest/screenshots/](PenTest/screenshots/) | Numbered engagement shots |
| Remediation map | [Remediation/v2.1.0-remediation.md](Remediation/v2.1.0-remediation.md) | Plan stub (implement next) |

---

## Branch / tags

| Ref | Purpose | Policy |
|-----|---------|--------|
| tag `v2.0.0` | Secure fork point | On `main` |
| **`ctf/v1.1.0`** | Replayable CTF + Red artifacts | **Freeze** — do not “fix” vulns here |
| tag **`v1.1.0`** | Immutable box snapshot | Create on publish |
| `remediation/v2.1.0` | Blue Team (from `main`) | Next cycle |
| tag `v2.1.0` | Secure parallel after harden | Later |

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
- [ADR-013](../../decisions/ADR-013-expansion-cycle-versioning.md) · [ADR-031](../../decisions/ADR-031-security-cycle-docs.md)
- Cycle-1 (closed): [../Cycle-1/README.md](../Cycle-1/README.md)

# shells-privesc — CTF Box Ready Declaration

Formal gate: Cycle-5 shells / PrivEsc CTF on branch **`ctf/shells-privesc`** is ready for Red.  
Product base remains tag **`v2.2.0`** (no SoftDev version bump — [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md)).  
Blue Team is a **separate** `remediation/shells-privesc` from `main` after Red freeze.

**Status:** **CTF-READY** — examiner dry-run green · Red writeup pending (P6) · branch **not** frozen until Red closes.

---

## What this release is

| Field | Value |
|-------|--------|
| Product base | Tag `v2.2.0` |
| CTF branch | `ctf/shells-privesc` |
| Overlay | `infra/docker-compose.prod.yml` + `infra/docker-compose.ctf-shells.yml` |
| Flags | `user.txt` + `root.txt` (`OS{` + 32 hex + `}`) |
| Style | Medium HTB — revshell / stable shell → sudo PrivEsc + decoys |
| Foothold | `kc-agent` HTTP command injection on `:8787` (not Notes XSS) |

---

## Surfaces

| Layer | Notes |
|-------|--------|
| HTTP `:8080` | Product stack (context only; Notes stay hardened) |
| Lab SSH `:2222` | Overlay — user `lab` |
| Lab agent `:8787` | Intentional cmdi → reverse shell as `lab` |
| PrivEsc | Writable `NOPASSWD` `/opt/kc-ops/backup.sh` |

Prod alone must **not** publish `:2222`, `:8787`, or `:5433`.

---

## Verification (operator)

```bash
git checkout ctf/shells-privesc
cp infra/.env.example infra/.env   # if needed
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
./infra/assert-pg-unpublished.sh
./infra/assert-ssh-unpublished.sh
./infra/cycle5-shells-examiner.sh
```

---

## Portfolio artifacts

| Artifact | Path |
|----------|------|
| Cycle index | [Cycle-5/README.md](../security/Cycle-5/README.md) |
| Decisions / P2 | [cycle-5-decisions.md](../security/Cycle-5/Dev/cycle-5-decisions.md) |
| Player brief | [shells-privesc-player-brief.md](../security/Cycle-5/Dev/shells-privesc-player-brief.md) |
| Ground truth | [shells-privesc-ground-truth.md](../security/Cycle-5/Dev/shells-privesc-ground-truth.md) |
| Execution | [shells-privesc-execution-plan.md](../security/Cycle-5/Dev/shells-privesc-execution-plan.md) |
| PenTest | [Cycle-5/PenTest/](../security/Cycle-5/PenTest/) (writeup on CTF branch — P6) |

---

## Gate checklist

- [x] Branch `ctf/shells-privesc` from `v2.2.0` tip (do not merge CTF into `main`)
- [x] Lab-host image: `lab`, flags, sudo PrivEsc, ~2 decoys
- [x] `kc-agent` foothold → RCE / path to reverse shell
- [x] Notes XSS **not** re-broken
- [x] Player brief (progressive hints) + ground truth
- [x] Examiner dry-run green (`cycle5-shells-examiner.sh`)
- [x] Prod asserts: no `:2222` / `:8787` / `:5433` on default prod alone
- [x] Red writeup + evidence (P6) — [shells-privesc-writeup.md](../security/Cycle-5/PenTest/shells-privesc-writeup.md)
- [ ] **Freeze** branch tip (no further CTF feature commits)
- [ ] Blue on `remediation/shells-privesc` (P7) — no product tag bump

---

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Dev / box | KL | 2026-08-26 | PASS — P0–P5 on `ctf/shells-privesc` |
| Examiner | KL | 2026-08-26 | PASS — `./infra/cycle5-shells-examiner.sh` |
| Red | KL | 2026-08-26 | PASS — 2/2 writeup on `ctf/shells-privesc` |

**Ship rule:** Use this branch for Cycle-5 CTF replay. Secure tip remains **`v2.2.0`** / `main`. Do not remediate vulns on the CTF branch after Red freeze (P6).

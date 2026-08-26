# Security Cycle 5 — Shells & PrivEsc

> **CTF branch FROZEN** — `ctf/shells-privesc` · baseline tag **`v2.2.0`** (ADR-032)  
> Replayable Red evidence only. **Do not** remediate vulns here. Blue: `remediation/shells-privesc` from `main`.

**Status:** **Red complete · branch frozen** · [writeup](PenTest/shells-privesc-writeup.md) 2/2 · Blue **next**  
**Packaging:** **CTF-only** — **no** `v1.3.0` SoftDev bump this cycle  
**Blue later:** `remediation/shells-privesc` (no product tag bump)  
**Difficulty:** Medium HTB  

| Track | Role | Status |
|-------|------|--------|
| Baseline | Secure tip **`v2.2.0`** / `main` | Shipped |
| CTF / Red | Shells + PrivEsc box | **Clear** — [writeup](PenTest/shells-privesc-writeup.md) · [brief](Dev/shells-privesc-player-brief.md) |
| Blue | Harden lab host; no product tag bump | After Red freeze |

---

## One-line story

Interesting CTF foothold → **stable / reverse shell** → enum (decoys) → **sudo PrivEsc** → `root.txt`. Self-contained — does not require Cycle-4.

## Deploy

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
./infra/cycle5-shells-examiner.sh
```

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player** | [player brief](Dev/shells-privesc-player-brief.md) | No |
| **Dev / examine** | [GT](Dev/shells-privesc-ground-truth.md) · [execution](Dev/shells-privesc-execution-plan.md) | Yes |
| **Red** | [PenTest/](PenTest/) → writeup (P6) | Yes |
| **Blue** | Remediation/ (after Red) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, brief, GT |
| [PenTest/](PenTest/) | Writeup on this CTF branch |
| Remediation/ | Create at Blue from `main` |

## References

- [shells-privesc-ctf-ready.md](../../release/shells-privesc-ctf-ready.md)  
- [shells-privesc-execution-plan.md](Dev/shells-privesc-execution-plan.md)  
- [cycle-5-decisions.md](Dev/cycle-5-decisions.md)  
- [shells-privesc-box-plan.md](Dev/shells-privesc-box-plan.md)  
- FC-14 — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)

# Security Cycle 5 — Shells & PrivEsc

**Status:** **Closed** · Red frozen · Blue merged to `main` ([PR #25](https://github.com/KLJr-Dev/KC-Project/pull/25)) · [secure-ready](../../release/shells-privesc-secure-ready.md)  
**Packaging:** **CTF-only** from tag **`v2.2.0`** ([ADR-032](../../decisions/ADR-032-post-v2.1.0-versioning.md)) — **no** SoftDev version bump  
**Tip posture:** optional SSH lab noise (`docker-compose.lab-host.yml`) · **no** `kc-agent` / PrivEsc plants  
**Difficulty:** Medium HTB  

| Track | Role | Status |
|-------|------|--------|
| Baseline | Secure tip **`v2.2.0`** | Shipped |
| CTF / Red | Shells + PrivEsc | **Frozen** — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md) |
| Blue | Harden tip; keep optional `:2222` noise | **Done** — [Remediation/](Remediation/) · frozen `remediation/shells-privesc` |

---

## One-line story

Interesting CTF foothold → **stable / reverse shell** → enum (decoys) → **sudo PrivEsc** → `root.txt`. Blue stripped agent + PrivEsc; tip may keep SSH overlay for future noise.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player / Red replay** | `git checkout ctf/shells-privesc` → [player brief](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/Dev/shells-privesc-player-brief.md) | Brief no · writeup yes |
| **Read the engagement** | [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md) | Yes |
| **Blue** | [Remediation/](Remediation/) | Yes |
| **Secure tip** | tag `v2.2.0` / `main` | No |

## Deploy (replay CTF)

```bash
git checkout ctf/shells-privesc
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-shells.yml up -d --build
```

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions / box / execution (planning on main) |
| [PenTest/](PenTest/) | Stub on main — full writeup on CTF branch |
| [Remediation/](Remediation/) | Blue plan + fix map + residuals |

## References

- [shells-privesc-secure-ready.md](../../release/shells-privesc-secure-ready.md)  
- [shells-privesc-ctf-ready.md](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/release/shells-privesc-ctf-ready.md) (CTF branch)  
- [cycle-5-decisions.md](Dev/cycle-5-decisions.md)  
- FC-14 — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)

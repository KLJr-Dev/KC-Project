# Security Cycle 5 — Shells & PrivEsc

**Status:** **Blue in progress** · Red **frozen** on `ctf/shells-privesc` · [secure-ready](../../release/shells-privesc-secure-ready.md)  
**Packaging:** **CTF-only** from tag **`v2.2.0`** ([ADR-032](../../decisions/ADR-032-post-v2.1.0-versioning.md)) — **no** `v1.3.0` SoftDev bump  
**Blue:** `remediation/shells-privesc` · optional SSH lab noise kept · **no** `kc-agent` / PrivEsc on tip  
**Difficulty:** Medium HTB  

| Track | Role | Status |
|-------|------|--------|
| Baseline | Secure tip **`v2.2.0`** | Shipped |
| CTF / Red | Shells + PrivEsc | **Frozen** — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md) |
| Blue | Harden tip; keep optional `:2222` noise | **This branch** — [Remediation/](Remediation/) |

---

## One-line story

Interesting CTF foothold → **stable / reverse shell** → enum (decoys) → **sudo PrivEsc** → `root.txt`. Blue strips agent + PrivEsc; tip may keep SSH overlay for future noise.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Player / Red replay** | `ctf/shells-privesc` → player brief / writeup | Writeup yes |
| **Blue** | [Remediation/](Remediation/) | Yes |
| **Secure tip** | tag `v2.2.0` / `main` after Blue merge | No |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions / box / execution (planning) |
| [PenTest/](PenTest/) | Stub on main — full writeup on CTF branch |
| [Remediation/](Remediation/) | Blue plan + fix map + residuals |

## References

- [shells-privesc-secure-ready.md](../../release/shells-privesc-secure-ready.md)  
- [cycle-5-decisions.md](Dev/cycle-5-decisions.md)  
- FC-14 — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)

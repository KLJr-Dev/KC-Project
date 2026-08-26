# Security Cycle 5 — Shells & PrivEsc

> **CTF branch:** `ctf/shells-privesc` · baseline tag **`v2.2.0`** (ADR-032)  
> **Do not merge** this branch into `main` with CTF breaks. Blue lands via `remediation/shells-privesc` from `main`.

**Status:** **CTF branch live** · [execution plan](Dev/shells-privesc-execution-plan.md) · build **next** (P2 design lock)  
**Packaging:** **CTF-only** — **no** `v1.3.0` SoftDev bump this cycle  
**Blue later:** `remediation/shells-privesc` (no product tag bump)  
**Difficulty:** Medium HTB  

| Track | Role | Status |
|-------|------|--------|
| Baseline | Secure tip **`v2.2.0`** / `main` | Shipped |
| CTF / Red | Shells + PrivEsc box (blank slate) | **This branch** — [execution](Dev/shells-privesc-execution-plan.md) · [box](Dev/shells-privesc-box-plan.md) |
| Blue | Harden lab host; no product tag bump | After Red |

---

## One-line story

Interesting CTF foothold → **stable / reverse shell** → enum (decoys) → **sudo PrivEsc** → `root.txt`. Self-contained — does not require Cycle-4.

## Why after Cycle-4

- C4 SoftDev pair taught Notes XSS + SSH *foothold* on a versioned tip  
- C5 adds **post-ex complexity** without another SoftDev product bump while `v2.2.0` is fresh  

## Portfolio paths (after build)

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Dev / build** | [execution plan](Dev/shells-privesc-execution-plan.md) · [decisions](Dev/cycle-5-decisions.md) | Yes |
| **Player** | player brief (pending P5) | No |
| **Red** | [PenTest/](PenTest/) → writeup on this branch | Yes |
| **Blue** | Remediation/ (after Red) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, **execution**, sketch; GT / brief when building |
| [PenTest/](PenTest/) | Writeup on this CTF branch |
| Remediation/ | Create at Blue from `main` |

## References

- [shells-privesc-execution-plan.md](Dev/shells-privesc-execution-plan.md)  
- [cycle-5-decisions.md](Dev/cycle-5-decisions.md)  
- [shells-privesc-box-plan.md](Dev/shells-privesc-box-plan.md)  
- FC-14 — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)

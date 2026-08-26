# Security Cycle 5 — Shells & PrivEsc

**Status:** **Decisions locked** · [execution plan](Dev/shells-privesc-execution-plan.md) · build **next**  
**Packaging:** **CTF-only** from tag **`v2.2.0`** ([ADR-032](../../decisions/ADR-032-post-v2.1.0-versioning.md)) — **no** `v1.3.0` SoftDev bump this cycle  
**Branch (planned):** `ctf/shells-privesc` · Blue later: `remediation/shells-privesc`  
**Difficulty:** Medium HTB  

| Track | Role | Status |
|-------|------|--------|
| Baseline | Secure tip **`v2.2.0`** | Shipped |
| CTF / Red | Shells + PrivEsc box (blank slate) | **Next** — [execution](Dev/shells-privesc-execution-plan.md) · [box](Dev/shells-privesc-box-plan.md) |
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
| **Player** | `ctf/shells-privesc` → player brief (pending) | No |
| **Red** | [PenTest/](PenTest/) stub → writeup on ctf branch | Yes |
| **Blue** | Remediation/ (after Red) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, **execution**, sketch; GT / brief when building |
| [PenTest/](PenTest/) | Stub on main; writeup on ctf branch |
| Remediation/ | Create at Blue |

## References

- [shells-privesc-execution-plan.md](Dev/shells-privesc-execution-plan.md)  
- [cycle-5-decisions.md](Dev/cycle-5-decisions.md)  
- [shells-privesc-box-plan.md](Dev/shells-privesc-box-plan.md)  
- FC-14 — [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)

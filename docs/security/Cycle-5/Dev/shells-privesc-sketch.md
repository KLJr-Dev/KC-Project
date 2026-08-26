# Cycle-5 sketch — shells & privilege escalation

**Status:** Cycle **closed** (CTF + Blue) · SoftDev/`v1.3.0` pair was **deferred** → now [Cycle-6](../../Cycle-6/README.md) ([ADR-034](../../../decisions/ADR-034-cycle-6-product-expansion-pair.md))  
**Canonical:** [cycle-5-decisions.md](cycle-5-decisions.md) · [shells-privesc-box-plan.md](shells-privesc-box-plan.md)  
**Upstream baseline:** tag **`v2.2.0`** (CTF-only this cycle; no product bump)

---

## Intent

Players get a **blank-slate** medium box. Cycle-5 grades:

1. **Shell tradecraft** — reverse shell and/or stable interactive TTY; navigate the FS beyond a trivial `cat ~/user.txt`.  
2. **Writeup discipline** — reproducible recon → foothold → enum → PrivEsc → root.  
3. Supporting: enum + **one** sudo-class PrivEsc with OSCP-style decoys.

---

## Relationship to Cycle-4 / versions

| Approach | Status |
|----------|--------|
| SoftDev `v1.3.0` → `v2.3.0` | **Deferred** — tip just shipped `v2.2.0`; no new product surface yet |
| **CTF overlay/branch on `v2.2.0`** (ADR-032) | **Locked for Cycle-5** |
| Require finishing C4 | **No** — modular / isolated |

C4 `/opt/kc-lab` tease may get an easter egg; **live** C5 story is **fresh**.

---

## In scope

- CTF-only foothold (interesting; **not** Notes XSS reprise) → path to shell  
- Stable shell requirement before full clearance  
- Primary **sudo** PrivEsc + ~2 decoys  
- `user.txt` + `root.txt` (`OS{` + 32 hex + `}`)  
- Proper Red writeup  

## Out of scope

- Docker escape (FC-13)  
- Kernel-only path  
- SoftDev Notes epic / product version bump  
- AD / required off-box pivot  
- PrivEsc on default prod compose  

---

## Blue (when Cycle-5 runs)

- Harden lab host; strip CTF foothold + PrivEsc  
- No product version bump  
- SSH overlay may remain for later noise (FTP etc.) but secure tip asserts: no `:2222` on prod alone  

---

## Timing

```text
now     → v2.2.0 secure tip; C5 decisions + execution plan
next    → P0 commit → P1 ctf/shells-privesc → P2–P5 build/gate → P6 Red → P7 Blue (no tag bump)
later   → SoftDev v1.3.0+ when a real new product surface appears
```

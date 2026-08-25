# Cycle-5 sketch — shells & privilege escalation

**Status:** Sketch only · expand into a full box plan after `v2.2.0`  
**Upstream:** Cycle-4 foothold ([../../Cycle-4/Dev/v1.2.0-box-plan.md](../../Cycle-4/Dev/v1.2.0-box-plan.md))

---

## Intent

Players who finished Cycle-4 already know how to **reach SSH and loot files**. Cycle-5 assumes that skill and adds:

1. **Shell tradecraft** — reverse shell from a weak service or from SSH session upgrades; stabilize (`script`/`tmux`, proper TTY); transfer tools.  
2. **Enumeration** — `sudo -l`, SUID, cron, capabilities, writable scripts, kernel hints (keep difficulty **OSCP-like junior box**, not kernel CTF hell).  
3. **PrivEsc** — one primary path + optional rabbit holes; land **`root.txt`**.  
4. **Writeup discipline** — methodology section that looks like an exam/HTB report.

---

## Relationship to Cycle-4 image

| Approach | Pros | Cons |
|----------|------|------|
| **A. New CTF image/overlay on `v2.2.0`** (ADR-032) | No fake SoftDev version; secure `main` untouched | Second compose story to maintain |
| **B. SoftDev/`v1.3.0` if new web surface** | Full Red/Blue pair | Heavier; only if you add product features |

**Default recommendation:** SoftDev pair **`v1.3.0` → `v2.3.0`** (shells + PrivEsc), matching stakeholder lock that PrivEsc begins on `v1.3.0`. CTF overlay-only remains a fallback if no new product surface is needed.

---

## In scope (Cycle-5)

- Weak sudo (NOPASSWD for a script), or writable cron, or SUID binary you control — **pick one primary**.  
- Clear user → root path documented in ground truth.  
- Reverse shell *allowed* and documented (e.g. from a careless admin script or from upgrading SSH).  
- `user.txt` + `root.txt`.

## Out of scope (Cycle-5)

- Replacing Notes SoftDev (already Cycle-4).  
- Shipping PrivEsc image on secure prod compose.  
- Hard kernel exploits as the only path.

---

## Suggested primary PrivEsc flavors (pick later)

1. **sudo** — `kc` may run a backup script as root; script is writable or uses unsafe env.  
2. **cron** — root cron runs world-writable script in `/opt/kc-lab`.  
3. **SUID** — custom `kc-backup` binary with obvious bug (command injection).  

Tease in Cycle-4 via `/opt/kc-lab/README` (“TODO: lock down backup job”) **without** leaving the misconfig live on `v1.2.0`.

---

## Blue (when Cycle-5 runs)

- CTF/lab overlay only; assert secure compose has no SSH.  
- Remediation writeup = “how we’d harden the jump host,” not product XSS (already closed in `v2.2.0`).

---

## Timing

```text
now     → Cycle-4 docs + SoftDev Notes + SSH foothold
v1.2.0  → Red (stop at user.txt)
v2.2.0  → Blue Notes
soon    → Cycle-5 full box plan → build PrivEsc SSH image → Red/Blue lab close-out
```

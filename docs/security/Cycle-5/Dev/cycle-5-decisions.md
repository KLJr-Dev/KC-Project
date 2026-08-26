# Cycle-5 — locked decisions (grill 2026-08-25)

Derived from stakeholder answers + recommendations on open items.  
**Supersedes:** SoftDev pair `v1.3.0`/`v2.3.0` as the *default* for this cycle (deferred).  
**Consumes:** FC-14 (shells / PrivEsc depth). FC-13 (docker escape) **out**.  
**Box:** [shells-privesc-box-plan.md](shells-privesc-box-plan.md) · **Execution:** [shells-privesc-execution-plan.md](shells-privesc-execution-plan.md) · **Sketch:** [shells-privesc-sketch.md](shells-privesc-sketch.md)

---

## A. Packaging / versioning

| # | Topic | Locked | Notes |
|---|--------|--------|-------|
| 1 | Ship shape | **CTF-only** from tag **`v2.2.0`** ([ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md)) | No `v1.3.0` SoftDev bump *yet* — tip just shipped secure; room to misconfigure without fake product versions |
| 1b | SoftDev pair later | **Deferred** → **Cycle-6** | Product expansion `v1.3.0`/`v2.3.0` = Link Preview SSRF + CSRF ([Cycle-6](../../Cycle-6/README.md) · [ADR-034](../../../decisions/ADR-034-cycle-6-product-expansion-pair.md)) |
| 2 | Isolation | **Blank slate** — modular, self-contained | Players need not have finished Cycle-4; brief may say “web app + lab host” without C4 spoilers |

```text
main @ v2.2.0 (secure)
  → fork ctf/shells-privesc
  → CTF misconfigs + PrivEsc SSH image (overlay)
  → Red writeup (medium HTB depth)
  → remediation/shells-privesc → harden lab host / remove CTF plants → merge main (no version bump)
  → freeze ctf/ + remediation/ archives
```

---

## B. Complexity / pedagogy

| # | Topic | Locked |
|---|--------|--------|
| 3 | Primary graded skills | **1. Reverse shell / stable shell tradecraft** · **2. Writeup discipline** (enum → path → root, reproducible) |
| 3b | Supporting skills | Enumeration + one PrivEsc class (means to the writeup, not the only grade) |
| 4 | Shell model | **Hybrid (C):** password/SSH or initial foothold alone is **not** enough for full clearance — player must obtain a **stable interactive shell** (revshell and/or pty upgrade: `script`/`python`/`script`/tmux) before reliable enum / flag navigation |
| 4b | “cd ../../../../” intent | Flags and PrivEsc clues **may live outside `~`** — restricted cwd / need real shell to walk the FS is intentional teaching, not a web LFI gag |
| 5 | Branching | **One primary PrivEsc** + **~2 decoys** (OSCP-style: linear success path, not super-obvious; rabbit holes that look real) |
| 15 | Difficulty | **Medium HTB** — more challenging than Cycles 2–4 railroads; still junior-exam solvable with method |

---

## C. PrivEsc & host

| # | Topic | Locked | Recommendation (adopted) |
|---|--------|--------|---------------------------|
| 6 | Primary PrivEsc | **Stakeholder: undecided** → **locked: sudo** | `lab` (or foothold user) has `NOPASSWD` on a **fresh-story** helper script (e.g. backup/inventory) that is **writable** or uses **unsafe args/env** — classic, teachable, medium |
| 6b | Decoys | Two | e.g. (1) cron that looks juicy but isn’t root / wrong perms (2) SUID binary that doesn’t yield root (or needs unused exploit) |
| 7 | Docker / FC-13 | **Out of Cycle-5** | Plenty of depth *inside* the container/VM; escape reserved for a later cycle |
| 10 | Story | **Fresh** | Do **not** require living the C4 `/opt/kc-lab` “backup TODO” tease — new names/paths/lore (optional easter-egg nod OK) |
| 13 | Hard bans | **Locked** | No kernel-only sole path · no docker escape · no AD · no required off-box pivot · no “guess the one weird binary” as only path |

---

## D. Flags & loot

| # | Topic | Locked |
|---|--------|--------|
| 8 | Flags | **`user.txt` + `root.txt`** only (no required mid-flag) |
| 9 | Format | **`OS{` + 32 lowercase hex + `}`** (same as Cycle-4) |
| 8b | Placement | `user.txt` reachable after **stable shell** + light enum; `root.txt` after primary PrivEsc |

---

## E. Web / product (CTF branch only)

| # | Topic | Locked | Recommendation (adopted) |
|---|--------|--------|---------------------------|
| 11 | Notes XSS | **Do not re-break** hardened Notes on CTF for C5 | XSS already taught in C4; re-opening muddies Blue/`v2.2.0` story |
| 11b | “Something interesting” | **CTF-only foothold** | Add a **small intentional weak service or route** on the CTF branch/overlay (fresh story) that leads to **command execution or file write → reverse shell** — e.g. careless “agent/status/backup” HTTP helper on a lab port, or CTF-only upload/exec gadget. Keep product Notes UX intact. |
| 11c | SSH role | **Present on overlay** | Host entry may still offer SSH (creds from plant or after foothold); primary teaching is **shell tradecraft**, not “SSH then cat” |
| 12 | Demo `RolePass123!` | **Harden gradually on secure tip** (separate residual / SoftDev hygiene) | Not the C5 teaching center; optional CTF plant may still use weak host creds |

---

## F. Blue / residuals

| # | Topic | Locked |
|---|--------|--------|
| 14 | Blue outcome | **Harden the jump/lab host** — remove PrivEsc misconfig + CTF foothold service; document how we’d lock it down |
| 14b | SSH after Blue | **May remain as overlay** for future noise/services (FTP later) but **secure / irrelevant** on day-to-day tip — not a product feature; asserts stay (no `:2222` on default prod alone) |
| 14c | Product version | **No bump** (ADR-032) |

---

## G. Writeup / scope budget

| # | Topic | Locked |
|---|--------|--------|
| 16 | Build time | **Not a constraint** — box quality over schedule |
| 17 | Writeup bar | **Proper portfolio writeup** — long as needed so someone with adequate skill can **recreate the pentest successfully** (recon → foothold → stable shell → enum → PrivEsc → flags) |

---

## One-line story (locked)

**Blank-slate CTF on `v2.2.0`:** interesting CTF foothold → **reverse / stable shell** → enum (with decoys) → **one sudo-style PrivEsc** → `root.txt`. Blue hardens the lab host; `main` stays secure tip without a version bump.

---

## Open only at build time (not pedagogy)

- Exact service name / port for CTF foothold  
- Exact sudo script path and bug (writable vs wildcard vs env)  
- Flag hex values  
- Branch name: prefer **`ctf/shells-privesc`** (scenario-style like `leak-crack-db`)

---

## Explicit non-goals (this cycle)

- SoftDev `v1.3.0` / Notes SoftDev epic  
- Docker escape / privileged mount as a path  
- Kernel exploit as sole path  
- Requiring Cycle-4 completion  
- Shipping PrivEsc on default `docker-compose.prod.yml`

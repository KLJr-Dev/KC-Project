# Cycle-5 execution plan — build `ctf/shells-privesc`

**Status:** Decisions **locked** · build **not started**  
**Locks:** [cycle-5-decisions.md](cycle-5-decisions.md) · **Box:** [shells-privesc-box-plan.md](shells-privesc-box-plan.md)  
**Baseline:** tag **`v2.2.0`** · [ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md) (CTF-only; **no** product version bump)  
**Difficulty:** Medium HTB · blank slate  

---

## Pattern (Cycle-3 CTF culture + Cycle-4 gate discipline)

```text
main @ v2.2.0 (secure tip)
  → git checkout -b ctf/shells-privesc   # never merge CTF breaks into main
  → CTF foothold gadget + PrivEsc SSH image (overlay)
  → Dev triad: player brief · ground truth · ctf-ready gate
  → Examiner dry-run green
  → Red writeup on ctf branch (freeze)
  → remediation/shells-privesc → harden lab / strip CTF → PR main (no tag bump)
  → freeze remediation/* archive
```

Unlike Cycle-4 SoftDev, **insecure tip does not land on `main`**. Like Cycle-3: misconfigure current app + lab host on a **`ctf/*`** branch only.

---

## Definition of Done (CTF ready for Red)

- [ ] Branch `ctf/shells-privesc` from tag/`main` @ `v2.2.0`
- [ ] Fresh-story **CTF foothold** (not Notes XSS) → path to reverse shell
- [ ] SSH/lab image: foothold user, **sudo** PrivEsc primary, **~2 decoys**
- [ ] Stable-shell requirement enforced by design (flags/clues outside trivial `~` OK)
- [ ] Flags `user.txt` + `root.txt` (`OS{` + 32 hex + `}`)
- [ ] Progressive hints in player brief; full spoilers in GT
- [ ] No published PG · no docker escape · no kernel-only path
- [ ] Examiner dry-run script green
- [ ] `docs/release/shells-privesc-ctf-ready.md` (or equivalent) signed
- [ ] PenTest stub on `main` points at ctf branch (Cycle-4 pattern)

---

## Phases

### P0 — Docs scaffold on `main` (can land before branch)

| Deliverable | Path / action |
|-------------|----------------|
| Decisions (done) | [cycle-5-decisions.md](cycle-5-decisions.md) |
| Box plan (done) | [shells-privesc-box-plan.md](shells-privesc-box-plan.md) |
| This execution plan | [shells-privesc-execution-plan.md](shells-privesc-execution-plan.md) |
| Cycle-5 hub status | [../README.md](../README.md) → “build next” |
| Bucket B | FC-14 shells locked; FC-13 later |
| PenTest stub on main | `docs/security/Cycle-5/PenTest/README.md` — “live on ctf/…” |

**Exit:** P0 committed to `main` (hotfix OK). SoftDev rails **not** reset for this cycle.

---

### P1 — Create CTF branch + freeze baseline

```bash
git fetch origin
git checkout -b ctf/shells-privesc v2.2.0   # or origin/main at v2.2.0 tip
git push -u origin ctf/shells-privesc
```

| Rule | Detail |
|------|--------|
| Do **not** merge this branch into `main` with CTF breaks | Same as `ctf/leak-crack-db` / `ctf/v1.2.0` |
| Product Notes stay hardened | No SoftDev XSS re-break |
| Compose | Keep `docker-compose.prod.yml` clean on intent; CTF adds overlay(s) and/or CTF-only service defs |

**Exit:** Remote branch exists; README on branch states CTF baseline `v2.2.0`.

---

### P2 — Design lock (build-time choices)

Fill the “open at build time” rows from decisions **before** coding:

| Choice | Options / pick |
|--------|----------------|
| Foothold story name | e.g. `kc-agent`, backup status, inventory API — **fresh lore** |
| Foothold surface | Host port / path / sidecar container |
| Bug class | Command injection, writable upload→exec, SSTI, etc. — must yield **RCE → revshell** |
| Foothold user | Align with SSH user or drop into same UID |
| Sudo target | Script path + bug (writable script vs unsafe args/env) |
| Decoy A / B | Cron decoy · SUID decoy (document in GT why they fail) |
| Flag values | Generate two `OS{32hex}`; store **only** in GT |
| Creds | Host user password / key material — GT only |

**Exit:** Short “P2 lock” subsection appended to GT draft or decisions appendix.

---

### P3 — Lab host image (PrivEsc + decoys)

Primary workstream — most of the medium-HTB complexity lives here.

| Piece | Requirement |
|-------|-------------|
| Image | Extend or replace Cycle-4 SSH image lineage; **new** story paths (don’t require C4 `/opt/kc-lab` live bug) |
| Overlay | `docker-compose` SSH (or combined CTF overlay) — **assert** prod alone still has no `:2222` |
| User | Non-root foothold account |
| Primary | `sudo` NOPASSWD → helper script with intentional bug |
| Decoys | ~2 believable dead ends |
| Flags | `user.txt` (post–stable-shell) · `root.txt` (post-PrivEsc) |
| Loot | Light home/opt clutter; no second real root path |

**Exit:** `docker compose … up` → examiner can sudo-PrivEsc to root and read both flags.

---

### P4 — CTF foothold gadget (web / agent)

Blank-slate entry — interesting, **not** Notes XSS.

| Piece | Requirement |
|-------|-------------|
| Surface | CTF-only service or route (sidecar preferred so `main` stays clean) |
| Outcome | Clear path to **reverse shell** (document listener expectation in GT) |
| Isolation | Absent or inert on secure tip after Blue |
| Docs | Player brief: progressive hints only |

**Exit:** From clean VM/Kali, foothold → shell without GT spoilers (examiner uses GT).

---

### P5 — Dev triad + examiner + gate

| Doc / script | Audience | Spoilers |
|--------------|----------|----------|
| `v*-player-brief.md` (name TBD) | Players | Progressive hints, no flags |
| `v*-ground-truth.md` | Examiner | Full path, creds, flags, decoy notes |
| `docs/release/shells-privesc-ctf-ready.md` | Gate | Unsigned until dry-run |
| `infra/cycle5-*-examiner.sh` (name TBD) | Examiner | Assert foothold + user + root (or staged checks) |
| PenTest/ on **ctf branch** | Red | Writeup + screenshots later |

**Exit:** Gate checklist drafted; examiner script **PASS** on dry-run.

---

### P6 — Red freeze

| Step | Action |
|------|--------|
| 1 | Play the box cold (or second machine) |
| 2 | Writeup: recon → foothold → stable shell → enum → PrivEsc → flags |
| 3 | Screenshots / notes on `ctf/shells-privesc` |
| 4 | Sign ctf-ready if not already |
| 5 | **Freeze** branch tip (no further CTF feature commits) |

**Exit:** Writeup meets bar: adequate skill can recreate successfully.

---

### P7 — Blue (after Red)

| Step | Action |
|------|--------|
| 1 | Branch `remediation/shells-privesc` from `main` (or from ctf for evidence-only — prefer fixes on mainline secure tree) |
| 2 | Remove foothold gadget · fix sudo/script · neutralize decoys as needed |
| 3 | Regression: assert no CTF service on prod; assert-ssh unpublished; optional examiner “must fail” |
| 4 | Blue plan + remediation map + residuals + secure-ready (**no** `v2.3.0` tag) |
| 5 | PR → `main` · freeze remediation archive |

**Exit:** Secure tip still `v2.2.0` lineage; Cycle-5 closed like Cycle-3.

---

## Workstream map (parallelism)

```text
P0 docs (main) ──► P1 branch
                      ├── P2 design lock
                      ├── P3 host image ──┐
                      └── P4 foothold ────┼──► P5 GT/brief/examiner ──► P6 Red ──► P7 Blue
```

P3 and P4 can parallel after P2. P5 needs both green.

---

## Must-ship plants

| ID | Change |
|----|--------|
| P-host-1 | Foothold user + home layout |
| P-host-2 | `user.txt` placement (stable-shell gated by design) |
| P-host-3 | Primary sudo PrivEsc |
| P-host-4 | Decoy cron |
| P-host-5 | Decoy SUID (or second decoy) |
| P-host-6 | `root.txt` |
| P-web-1 | CTF foothold → RCE/revshell |
| P-doc-1 | Player brief + GT + ctf-ready |
| P-doc-2 | Examiner script |
| P-doc-3 | PenTest stub on main → ctf URL after freeze |

### Cut if needed
Extra loot files · third decoy · SSH password plant (if foothold already drops shell).

### Must not
Merge CTF into `main` · docker escape · Notes XSS reprise · published `:5433` · SoftDev version tag · PrivEsc on default prod compose alone.

---

## Immediate next

1. ~~Commit P0~~ · ~~P1 branch~~ · ~~P2 design lock~~ (flags in GT).  
2. **P3:** `infra/lab-host/` + compose overlay.  
3. **P4:** `kc-agent` on `:8787`.  
4. **P5:** brief · examiner · sign ctf-ready.

# Blue Team plan — Cycle-10 → `v2.10.0`

**Branch:** `remediation/v2.10.0` (from tag `v1.10.0` + SoftDev B2 bastion plant)  
**Finding → fix map:** [v2.10.0-remediation.md](v2.10.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md) — **must be empty at ship**  
**Handoff:** [blue-handoff.md](blue-handoff.md)  
**Red evidence (frozen):** branch `ctf/v1.10.0` · tag `v1.10.0` · writeup on CTF only

| Field | Value |
|-------|-------|
| Cycle | 10 (Enterprise five-zone defence pair) |
| From | Intentional insecure tip `v1.10.0` (Stage-0 → RCE → PrivEsc → archive → bastion crown) |
| To | Tag **`v2.10.0`** — plants closed; zero accepted residuals; sole `:443` |
| Current milestone | **M0** — plan + handoff signed |

```text
tag v1.10.0 (insecure tip)
  ──► remediation/v2.10.0 ──► PR main ──► tag v2.10.0
         ▲
ctf/v1.10.0 (frozen Red) ── findings only; do not merge CTF into main
```

---

## Mission

Close Cycle-10 Red findings on the product tip: no public moderator mint, no shell-injection helper, no sudo/GTFOBins on docproc, no archive credential loot path, no password-reuse + full-sudo bastion crown. Keep Cycles 6–9 Blue controls closed. Ship with **zero** accepted security residuals (ADR-039).

**Success** = C10-F01…F05 verified · graded `OS{…}` absent from tip · tip string `v2.10.0` · secure-ready signed · merge → tag.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Blue plan + remediation map + empty residuals + handoff | **In progress** |
| **M1** | Wave A — app plants | F01 (access-requests) + F02 (packets/helper) closed | Pending |
| **M2** | Wave A — infra plants | F03 (docproc sudo) + F04 (archive secrets/zoning) + F05 (bastion) closed | Pending |
| **M3** | Tip hygiene | Flags stripped; tip `v2.10.0`; `CYCLE10-PLANT` gone; compose still sole `:443` | Pending |
| **M4** | Asserts | `cycle10-blue-assert.sh` (or equiv) wired into smoke/journey | Pending |
| **M5** | Gate + tag | smoke/journey/tls · residuals empty · PR → `main` · tag `v2.10.0` · sign secure-ready | Pending |

---

## Wave guidance (order of attack)

1. **F02 first if parallelizing** — Critical RCE; encode name + drop `shell=True`.
2. **F01** — kill public moderator mint (breaks Stage-0 without needing RCE).
3. **F03** — remove sudoers + run non-root; delete root proofs from image.
4. **F04** — rotate archive creds; scrub seed notes; tighten DATA exposure from APP.
5. **F05** — remove `ALL=(ALL)` sudoers; unique SSH secret ≠ any docproc file; unpublished crown.

Prefer least-privilege + delete plant over “security through obscurity” decoys.

---

## Out of scope

Re-breaking C6–C9 closed plants · publishing non-443 HostPorts · merging CTF screenshots/writeup into tip · Samba JUMPBOX as a graded path (optional Red noise only).

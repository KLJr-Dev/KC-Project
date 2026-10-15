# Blue Team plan — Cycle-9 → `v2.6.0`

**Branch:** `remediation/v2.6.0` (from tag `v1.6.0`)  
**Finding → fix map:** [v2.6.0-remediation.md](v2.6.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md)  
**Handoff:** [blue-handoff.md](blue-handoff.md)  
**Red evidence (frozen):** branch `ctf/v1.6.0` · tag `v1.6.0` · [writeup](../PenTest/v1.6.0-writeup.md)

| Field | Value |
|-------|-------|
| Cycle | 9 (Onboarding / HR defence pair) |
| From | Intentional insecure tip `v1.6.0` (Nest BFF hop trust + onboarding plants) |
| To | Tag **`v2.6.0`** — Intake verifies RS256; plants closed; Wave B ~80% |
| Current milestone | **M1 in progress** — Wave A plant closures |

```text
tag v1.6.0 (insecure tip)
  ──► remediation/v2.6.0 ──► PR main ──► tag v2.6.0
         ▲
ctf/v1.6.0 (frozen Red) ── findings only; do not merge CTF into main
```

---

## Mission

Close Cycle-9 Red findings on the product tip: Nest BFF never trusts client `X-User-*`; Intake **verifies RS256**; onboarding IDOR / race / export PT / SIEM leak plants leave the tip. Keep Cycle-6/7/8 Blue controls closed.

**Success** = C9-F01…F05 verified · graded `OS{…}` absent from tip APIs · tip string `v2.6.0` · secure-ready signed · merge → tag.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Blue plan + remediation map + residuals scaffold | **Done** |
| **M1** | Wave A — plants | F01–F05 code fixes; flags stripped from seed/export | **In progress** |
| **M2** | Wave B — gap closure | Per [gap-closure](../Dev/v1.6.0-gap-closure.md) ~80% | Pending |
| **M3** | Asserts | Negative probes for F1–F4 paths | Pending |
| **M4** | Gate + tag | smoke/journey · PR → `main` · tag `v2.6.0` | Pending |

---

## Out of scope

Re-breaking Cycle-6 Preview/CSRF · Notes XSS · Cycle-7 Ops LFI · Cycle-8 Intake SQLi · shells / AD / unpublished ports · full TLS-default (C10+).

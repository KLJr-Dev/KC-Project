# ADR-037: Immersion skin — Northwind product face (lab honesty outside the UI)

**Status:** Accepted (product UX / pedagogy; pairs with [ADR-036](./ADR-036-cycle-8-intake-tool-chain-pair.md))

**Date:** 2026-08-27

---

## Context

Through Cycle-7 the tip UI reads as a **security lab brochure**: hero copy about “built to be broken,” feature cards that name AppSec surfaces, and prominent demo-user chrome. That is honest for maintainers and recruiters who open `USAGE.md` / `SECURITY.md`, but it breaks **OSCP-style immersion** — exam and lab targets present as ordinary corporate apps (file portal, blog, warehouse site), not as “intentionally vulnerable teaching products.”

Cycle-8 (`v1.5.0` → `v2.5.0`) already frames the org story as **Northwind Intake**. Players and Blue both benefit if the **in-product face** matches that story on insecure *and* secure tips, while lab meta stays in docs/git — not in the homepage hero.

## Decision

### Product face vs lab meta

| Layer | Role | Where |
|-------|------|--------|
| **Immersion (game) face** | Looks like a company product: Northwind employee file portal / ops intake | Tip UI on **`v1.5.0` and `v2.5.0`** (and onward until amended) |
| **Lab honesty** | Insecure-by-design, CTF archives, spoiler rules, demo accounts | Root `README.md`, `USAGE.md`, `SECURITY.md`, cycle docs, release notes — **not** the marketing hero |

Repo / project name **KC-Project** remains the engineering identity. In-app brand shifts to **Northwind** (Ops / Intake) for immersion.

### Skin DoD (Cycle-8 SoftDev, both tips)

- Homepage: corporate hero + short supporting line + primary CTA (sign in / portal) — **not** “built to be broken” or a grid of security-feature cards as the first viewport.  
- Nav / chrome: Northwind Ops (files, notes, preview, ops handbook, intake) as product areas.  
- Demo-user panel: **lab-flag gated** or demoted (default off on immersion tips); examiners still use [`demo-users.md`](../deploy/demo-users.md).  
- Seed content: lightweight corp flavor (policies, staff-adjacent names aligned with Cycle-8 noise users) without spoiling the graded path.  
- Secure tip **`v2.5.0` keeps the Northwind face** — hardening is invisible controls, not reverting to a lab brochure.

### Explicit non-goals (this ADR)

- No extra graded web vulns “for realism” (IDOR / stale cookie / missing TLS as flags) — see Cycle-8 decisions.  
- No Windows client-side or AD required for immersion.  
- Does not rename the GitHub repo or drop KC-Project from portfolio framing.

## Consequences

- **Positive:** Red recon matches OSCP expectations; Blue demos still look like a real product; lab ethics stay documented outside the UI.  
- **Positive:** Single skin for insecure + secure tips avoids “fix = make it look like a CTF again.”  
- **Trade-off:** Recruiters who only open `:8080` need `USAGE.md` / README to learn it is a lab — acceptable; that was already the intended map.  
- **Follow-on:** Cycle-8 P3 frontend work implements skin; later cycles inherit Northwind face unless a future ADR reverts.

## References

- [Cycle-8 decisions](../security/Cycle-8/Dev/cycle-8-decisions.md) · [ADR-036](./ADR-036-cycle-8-intake-tool-chain-pair.md) · [USAGE.md](../../USAGE.md) · [SECURITY.md](../../SECURITY.md)

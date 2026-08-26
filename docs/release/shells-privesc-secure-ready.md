# shells-privesc — Secure-Ready Declaration (Cycle-5 Blue)

Formal gate: Cycle-5 findings closed on secure tip **`v2.2.0` / `main`** without a product version bump ([ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md)).

**Status:** **SIGNED** — asserts green · hardened lab-host noise only · no product tag bump.  
**Red archive:** frozen `ctf/shells-privesc` (do not remediate there).

---

## What this release is

| Field | Value |
|-------|--------|
| Product tip | Tag **`v2.2.0`** lineage (unchanged version) |
| Blue branch | `remediation/shells-privesc` |
| Closed | C5-F01 (`kc-agent` cmdi) · C5-F02 (writable sudo) |
| Kept | Optional `docker-compose.lab-host.yml` — SSH `:2222` noise only |
| Not on tip | `:8787` / `kc-agent` / CTF flags / writable sudo plant |

---

## Verification (operator)

```bash
git checkout main   # after PR #25
./infra/assert-pg-unpublished.sh
./infra/assert-ssh-unpublished.sh
# Optional noise (SSH only — no agent):
# docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.lab-host.yml up -d --build
```

Confirm: default prod alone has **no** `:2222`, `:8787`, or `:5433`.

---

## Portfolio artifacts

| Artifact | Path |
|----------|------|
| Blue plan | [Cycle-5/Remediation/blue-team-plan.md](../security/Cycle-5/Remediation/blue-team-plan.md) |
| Fix map | [shells-privesc-remediation.md](../security/Cycle-5/Remediation/shells-privesc-remediation.md) |
| Residuals | [accepted-residuals.md](../security/Cycle-5/Remediation/accepted-residuals.md) |
| Red writeup | [ctf branch](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md) |

---

## Gate checklist

- [x] CTF branch frozen with Red 2/2  
- [x] Hardened lab-host image (no agent / no sudo plant)  
- [x] Optional SSH-only overlay documented  
- [x] Asserts reject `:2222` / `:8787` / `lab-host` on prod alone  
- [x] Asserts executed green on this branch  
- [x] PR merged to `main` (#25)  
- [x] No product tag bump  
- [x] Freeze `remediation/shells-privesc` after merge  

---

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Blue | KL | 2026-08-26 | PASS — hardened lab-host · asserts · docs |
| Examiner | KL | 2026-08-26 | PASS — `assert-pg` / `assert-ssh` · no agent/sudo plant on tip image |

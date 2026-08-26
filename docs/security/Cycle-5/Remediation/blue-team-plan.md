# Blue Team plan — Cycle-5 shells / PrivEsc

**Branch:** `remediation/shells-privesc` (from `main` @ `v2.2.0` tip)  
**Finding → fix map:** [shells-privesc-remediation.md](shells-privesc-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md)  
**Secure-ready gate:** [../../../release/shells-privesc-secure-ready.md](../../../release/shells-privesc-secure-ready.md)  
**Red evidence (frozen):** `ctf/shells-privesc` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md)  
**ADR:** [ADR-032](../../../decisions/ADR-032-post-v2.1.0-versioning.md) — **no** product version bump

```text
main @ v2.2.0 (secure) ──► remediation/shells-privesc ──► PR main (docs + hardened lab noise)
                              ▲
ctf/shells-privesc (frozen) ──┘ findings only (do not merge CTF plants into main)
```

## Mission

Close Cycle-5 Red findings on the **secure tip** without a SoftDev bump:

1. **C5-F01** — no `kc-agent` / `:8787` command-injection surface on day-to-day tip  
2. **C5-F02** — no sudo NOPASSWD → user-writable script  
3. Keep **optional lab noise** (`:2222` via overlay) for future CTFs / realism — **not** a product feature; asserts stay

**Success** = findings Verified · asserts green · secure-ready signed · PR → `main` · CTF branch untouched · no `v2.3.0` tag.

## Milestones

| ID | Goal | Status |
|----|------|--------|
| M0 | Plan + fix map + residuals + secure-ready scaffold | **This PR** |
| M1 | C5-F01 — no kc-agent on secure tip | Hardened lab-host; CTF agent only on frozen branch |
| M2 | C5-F02 — no writable-sudo plant on secure tip | Hardened image has no sudoers plant |
| M3 | Optional SSH noise overlay (`lab-host` `:2222` only) | `docker-compose.lab-host.yml` |
| M4 | Asserts + secure-ready + merge | Gate + PR |

## Rules

- Freeze Red on `ctf/shells-privesc` — no silent fixes there.  
- Do **not** merge `docker-compose.ctf-shells.yml` / vulnerable `kc-agent` into `main`.  
- Future CTFs may add/remove ports on new `ctf/*` forks; tip noise stays optional overlays.  
- No product version bump.

## Hand-off checklist

- [x] Red writeup accepted · CTF frozen  
- [x] Branch `remediation/shells-privesc` from `main`  
- [x] M1–M4 complete + gate green  
- [x] Merge remediation PR to `main` (#25)  
- [x] Freeze this remediation branch after merge

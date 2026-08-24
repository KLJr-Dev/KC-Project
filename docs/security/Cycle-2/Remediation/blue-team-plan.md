# Blue Team plan — Cycle 2 → v2.1.0

**Source:** [../PenTest/v1.1.0-writeup.md](../PenTest/v1.1.0-writeup.md)  
**Fix map:** [v2.1.0-remediation.md](v2.1.0-remediation.md)  
**CTF evidence (frozen):** branch / tag `v1.1.0` on `ctf/v1.1.0`

```text
v2.0.0 (main) ──► remediation/v2.1.0 ──► tag v2.1.0
                      ▲
ctf/v1.1.0 (frozen) ──┘ findings only (do not merge CTF into main)
```

## Milestones (sketch)

| ID | Goal | Status |
|----|------|--------|
| M0 | Plan signed (this doc + fix map) | **Open** |
| M1 | C2-F01 ownership on secure path; CTF_MODE stays opt-in | Pending |
| M2 | C2-F02 DB role authz + no weak HS256 on secure compose | Pending |
| M3 | C2-F03 no host PG on secure; no loot passwords in seeds | Pending |
| M4 | C2-F04 TLS guidance / Secure cookies for non-loopback | Pending |
| M5 | E2e deny IDOR + forged admin without CTF; docs; tag `v2.1.0` | Pending |

## Rules

- Freeze Red evidence on `ctf/v1.1.0` — no “silent fixes” there.  
- Secure defaults never enable `CTF_MODE`.  
- After tag `v2.1.0`, next CTF (if any) forks from that tag (ADR-013).

## Hand-off checklist

- [ ] Red writeup accepted as input  
- [ ] Branch `remediation/v2.1.0` from `main`  
- [ ] M1–M5 complete + gate green  
- [ ] Tag `v2.1.0`  

# Security & Penetration Testing

## Cycle workspace

**[Cycle-1/](Cycle-1/README.md)** — Closed: v1.0.0 → v2.0.0 (tag `v2.0.0` on `main`).

**[Cycle-2/](Cycle-2/README.md)** — **CTF shipped** on `ctf/v1.1.0` (replayable) · Red writeup complete · Blue = `v2.1.0` next.  
- Play (no spoilers): [Cycle-2/Dev/v1.1.0-player-brief.md](Cycle-2/Dev/v1.1.0-player-brief.md)  
- Report: [Cycle-2/PenTest/v1.1.0-writeup.md](Cycle-2/PenTest/v1.1.0-writeup.md)  
- Gate: [v1.1.0-ctf-ready.md](../release/v1.1.0-ctf-ready.md)

| Cycle | Dev | PenTest | Remediation |
|-------|-----|---------|-------------|
| 1 | [v1.0.0-ground-truth.md](Cycle-1/Dev/v1.0.0-ground-truth.md) | [v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md) | [v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md) |
| 2 | [box plan](Cycle-2/Dev/v1.1.0-box-plan.md) · [ground truth](Cycle-2/Dev/v1.1.0-ground-truth.md) · [player brief](Cycle-2/Dev/v1.1.0-player-brief.md) | [v1.1.0-writeup.md](Cycle-2/PenTest/v1.1.0-writeup.md) | [v2.1.0-remediation.md](Cycle-2/Remediation/v2.1.0-remediation.md) |

Legacy redirect: [pentest-cheat-sheet.md](pentest-cheat-sheet.md) → Cycle-1 ground truth

## Cross-cycle references

- [ctf-methodologies.md](ctf-methodologies.md) — OSCP+ exam structure, KC mapping, future CTF formats
- [cwe-inventory.md](cwe-inventory.md) — Cycle-1 inventory (59 / 38); Cycle-2 is intentional CTF breaks, not a full CWE dump
- [pentest-journeys.md](../deploy/pentest-journeys.md) — Cycle-1 narrative paths
- [demo-users.md](../deploy/demo-users.md) — demo accounts (strong passwords remain on CTF; spray target is separate)
- [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md) — Cycle-1 Red gate
- [v1.1.0-ctf-ready.md](../release/v1.1.0-ctf-ready.md) — Cycle-2 CTF gate (**ready to tag**)
- [v2.0.0-secure-ready.md](../release/v2.0.0-secure-ready.md) — Cycle-1 Blue gate
- [security-baseline.md](../spec/security-baseline.md) — v2.0.0 control checklist

## Scope

- **Cycle 1:** complete (insecure MVP → secure parallel `v2.0.0`).
- **Cycle 2:** OSCP-style CTF frozen on `ctf/v1.1.0`; remediation → `v2.1.0` from `main`.

## Tools (typical)

- nmap, gobuster/ffuf, Burp or curl, hydra, JWT crack/forge, `psql`
- CTF stack: `infra/docker-compose.prod.yml` + `docker-compose.ctf.yml`

## Entry points (CTF overlay)

| Surface | URL / path | Auth |
|---------|------------|------|
| App UI | `http://<target>:8080` | Browser + JWT |
| API | `http://<target>:8080/api/*` | Bearer JWT |
| OpenAPI | `/api/docs` when Swagger enabled on CTF | Often open on CTF |
| PostgreSQL | `<target>:5433` | After loot — not default creds |

## Methodology (Cycle-2)

1. Deploy CTF compose; confirm scope ports only  
2. Enumerate + foothold (register and/or spray)  
3. Prove user / admin / DB tiers (identity + hex)  
4. Document in [Cycle-2 PenTest writeup](Cycle-2/PenTest/v1.1.0-writeup.md)  
5. Hand off to [v2.1.0 remediation](Cycle-2/Remediation/v2.1.0-remediation.md)

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [ADR-031](../decisions/ADR-031-security-cycle-docs.md)
- [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md)

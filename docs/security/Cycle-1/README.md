# Security Cycle 1 (v1.0.0 → v2.0.0)

Cycle 1 covers the insecure MVP baseline and its secure parallel.

## Version map

| Version | Role | Status |
|---------|------|--------|
| v1.0.0 | Insecure baseline (59 CWE instances / 38 IDs) | **Pentest complete** (Cycle-1 offensive) |
| v1.0.x | Pentest patches on same surface | N/A this cycle |
| v2.0.0 | Secure parallel — Cycle-1 findings remediated | **Blue Team in progress** |

## Team workspaces

| Folder | Owner | Purpose |
|--------|-------|---------|
| [Dev/](Dev/) | Developer | Ground truth — exploitable state, repro steps, endpoint matrix |
| [PenTest/](PenTest/) | Offensive | Pentest writeup, notes, screenshots (portfolio piece) |
| [Remediation/](Remediation/) | Defensive | Finding → fix map + Blue Team implementation plan |

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Ground truth | [Dev/v1.0.0-ground-truth.md](Dev/v1.0.0-ground-truth.md) | Complete |
| Pentest writeup | [PenTest/v1.0.0-writeup.md](PenTest/v1.0.0-writeup.md) | **Complete** (OSCP-style; 13 findings) |
| Remediation map | [Remediation/v2.0.0-remediation.md](Remediation/v2.0.0-remediation.md) | **Handoff ready** |
| Blue Team plan | [Remediation/blue-team-plan.md](Remediation/blue-team-plan.md) | Written on `remediation/v2.0.0` |
| CWE inventory | [../cwe-inventory.md](../cwe-inventory.md) | Cross-cycle |

## Handoff gate (Cycle-1)

- [x] Offensive writeup + evidence (Critical/High proven)
- [x] Findings → fix intent → **files to change**
- [x] PenTest branch artifacts committed (`pentest/cycle-1`)
- [x] Cut / work `remediation/v2.0.0` — plan written; implement Wave A+
- [ ] Tag v2.0.0 when baseline + e2e green
- [ ] Design v1.1.0 CTF (narrower) after secure parallel exists

**Offensive → Defensive handoff: APPROVED** (2026-08-21). Implementation lives on `remediation/v2.0.0` ([blue-team-plan.md](Remediation/blue-team-plan.md)).

## Pre-pentest verification

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
./infra/e2e-docker.sh   # 150 tests
```

## References

- [ADR-013](../../decisions/ADR-013-expansion-cycle-versioning.md) — expansion cycle versioning
- [ADR-031](../../decisions/ADR-031-security-cycle-docs.md) — cycle doc structure
- [security-baseline.md](../../spec/security-baseline.md) — v2.0.0 control checklist

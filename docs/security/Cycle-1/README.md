# Security Cycle 1 (v1.0.0 → v2.0.0)

Cycle 1 covers the insecure MVP baseline and its secure parallel.

## Version map

| Version | Role | Status |
|---------|------|--------|
| v1.0.0 | Insecure baseline (59 CWE instances / 38 IDs) | Pentest-ready |
| v1.0.x | Pentest patches on same surface | Phase 2 (in progress) |
| v2.0.0 | Secure parallel — all Cycle-1 CWEs remediated | Planned |

## Team workspaces

| Folder | Owner | Purpose |
|--------|-------|---------|
| [Dev/](Dev/) | Developer | Ground truth — exploitable state, repro steps, endpoint matrix |
| [PenTest/](PenTest/) | Offensive | Pentest writeup, notes, screenshots (portfolio piece) |
| [Remediation/](Remediation/) | Defensive | Hardening writeup mapping findings → v2.0.0 fixes |

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Ground truth | [Dev/v1.0.0-ground-truth.md](Dev/v1.0.0-ground-truth.md) | Complete |
| Pentest writeup | [PenTest/v1.0.0-writeup.md](PenTest/v1.0.0-writeup.md) | Template |
| Remediation writeup | [Remediation/v2.0.0-remediation.md](Remediation/v2.0.0-remediation.md) | Template |
| CWE inventory | [../cwe-inventory.md](../cwe-inventory.md) | Cross-cycle |

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

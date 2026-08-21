# Security Cycle 1 (v1.0.0 → v2.0.0)

Cycle 1 covers the insecure MVP baseline, its structured pentest, and the secure parallel. **Closed** — tag `v2.0.0` on `main`.

## Version map

| Version | Role | Status |
|---------|------|--------|
| v1.0.0 | Insecure baseline (59 CWE instances / 38 IDs) | **Tagged** · pentest complete |
| v1.0.x | Accidental critical patches only (this cycle) | N/A |
| v2.0.0 | Secure parallel — Cycle-1 findings + security-baseline | **Tagged** on `main` |

## Team workspaces

| Folder | Owner | Purpose |
|--------|-------|---------|
| [Dev/](Dev/) | Developer | Ground truth — exploitable **before** state |
| [PenTest/](PenTest/) | Offensive | Portfolio writeup, notes, screenshots (**frozen** on `pentest/cycle-1`) |
| [Remediation/](Remediation/) | Defensive | Finding → fix map + Blue Team plan (merged via PR #17) |

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Ground truth | [Dev/v1.0.0-ground-truth.md](Dev/v1.0.0-ground-truth.md) | Complete (before-state) |
| Pentest writeup | [PenTest/v1.0.0-writeup.md](PenTest/v1.0.0-writeup.md) | Complete (13 findings) |
| Remediation map | [Remediation/v2.0.0-remediation.md](Remediation/v2.0.0-remediation.md) | Complete |
| Blue Team plan | [Remediation/blue-team-plan.md](Remediation/blue-team-plan.md) | M0–M9 complete |
| Accepted residuals | [Remediation/accepted-residuals-m8.md](Remediation/accepted-residuals-m8.md) | Documented |
| Secure-ready gate | [v2.0.0-secure-ready.md](../../release/v2.0.0-secure-ready.md) | Signed |
| CWE inventory | [../cwe-inventory.md](../cwe-inventory.md) | Cross-cycle (v1.0.0 baseline) |

## Branches / tags

| Ref | Purpose |
|-----|---------|
| tag `v1.0.0` | Insecure MVP freeze |
| tag `v2.0.0` | Secure parallel on `main` |
| `pentest/cycle-1` | Offensive evidence — do not rewrite vulns away |
| `remediation/v2.0.0` | Blue Team implementation (merged) |

## Handoff gate (Cycle-1)

- [x] Offensive writeup + evidence (Critical/High proven)
- [x] Findings → fix map + Blue Team milestones
- [x] M0–M9 implementation + [secure-ready](../../release/v2.0.0-secure-ready.md) signed
- [x] Merge to `main` · tag **`v2.0.0`**
- [ ] Design **v1.1.0** CTF (fork `v2.0.0`; misconfigure + flags; no new routes)

**Offensive → Defensive handoff: APPROVED** (2026-08-21).  
**Cycle-1 closed:** tag `v2.0.0` (2026-08-21).

## Verification commands

**Secure parallel (current `main` / tag `v2.0.0`):**

```bash
set -a && source infra/.env && set +a
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh && ./infra/journey-test.sh && ./infra/e2e-docker.sh
# optional TLS gate:
./infra/scripts/gen-lab-certs.sh
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.tls.yml up -d
./infra/tls-smoke.sh
```

**Insecure baseline (historical / Red):** check out tag `v1.0.0` or branch `pentest/cycle-1`.

## References

- [ADR-013](../../decisions/ADR-013-expansion-cycle-versioning.md) — expansion cycle versioning
- [ADR-031](../../decisions/ADR-031-security-cycle-docs.md) — cycle doc structure
- [security-baseline.md](../../spec/security-baseline.md) — v2.0.0 control checklist
- [v1.0.0-pentest-ready.md](../../release/v1.0.0-pentest-ready.md) — Red gate (passed)
- [v2.0.0-secure-ready.md](../../release/v2.0.0-secure-ready.md) — Blue gate (signed)

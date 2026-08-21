# Security Cycle 1 (v1.0.0 → v2.0.0)

Cycle 1 covers the insecure MVP baseline, its structured pentest, and the secure parallel.

## Version map

| Version | Role | Status |
|---------|------|--------|
| v1.0.0 | Insecure baseline (59 CWE instances / 38 IDs) | **Pentest complete** |
| v1.0.x | Accidental critical patches only (this cycle) | N/A — no crash/RCE patches required |
| v2.0.0 | Secure parallel — Cycle-1 findings remediated | **Blue Team — M0 done, M1 next** |

## Team workspaces

| Folder | Owner | Purpose |
|--------|-------|---------|
| [Dev/](Dev/) | Developer | Ground truth — exploitable state, repro steps, endpoint matrix |
| [PenTest/](PenTest/) | Offensive | Portfolio writeup, notes, screenshots (**frozen** on `pentest/cycle-1`) |
| [Remediation/](Remediation/) | Defensive | Finding → fix map + milestone plan (`remediation/v2.0.0`) |

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Ground truth | [Dev/v1.0.0-ground-truth.md](Dev/v1.0.0-ground-truth.md) | Complete |
| Pentest writeup | [PenTest/v1.0.0-writeup.md](PenTest/v1.0.0-writeup.md) | **Complete** (OSCP-style; 13 findings) |
| Remediation map | [Remediation/v2.0.0-remediation.md](Remediation/v2.0.0-remediation.md) | **Complete** (milestone-tracked) |
| Blue Team plan | [Remediation/blue-team-plan.md](Remediation/blue-team-plan.md) | **M0 complete** — M1–M4 pending |
| Secure-ready gate | [v2.0.0-secure-ready.md](../../release/v2.0.0-secure-ready.md) | Scaffold open until ship |
| CWE inventory | [../cwe-inventory.md](../cwe-inventory.md) | Cross-cycle |

## Branches

| Branch | Purpose |
|--------|---------|
| `pentest/cycle-1` | Offensive evidence only — do not rewrite vulns away |
| `remediation/v2.0.0` | Secure parallel implementation + Blue Team docs |

## Handoff gate (Cycle-1)

- [x] Offensive writeup + evidence (Critical/High proven)
- [x] Findings → fix intent → **files to change**
- [x] PenTest branch artifacts committed (`pentest/cycle-1`)
- [x] Remediation branch + **M0** planning docs
- [ ] M1–M4 implementation + [secure-ready](../../release/v2.0.0-secure-ready.md) signed
- [ ] Tag `v2.0.0` when baseline + e2e green
- [ ] Design v1.1.0 CTF (narrower) after secure parallel exists

**Offensive → Defensive handoff: APPROVED** (2026-08-21).

## Verification commands

**Insecure baseline (historical / Red):**

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
./infra/e2e-docker.sh
```

**Secure parallel (Blue — after each milestone):** same scripts under **deny** expectations; plus re-PoCs in the secure-ready gate.

## References

- [ADR-013](../../decisions/ADR-013-expansion-cycle-versioning.md) — expansion cycle versioning
- [ADR-031](../../decisions/ADR-031-security-cycle-docs.md) — cycle doc structure
- [security-baseline.md](../../spec/security-baseline.md) — v2.0.0 control checklist
- [v1.0.0-pentest-ready.md](../../release/v1.0.0-pentest-ready.md) — Red gate (passed)
- [v2.0.0-secure-ready.md](../../release/v2.0.0-secure-ready.md) — Blue gate (in progress)

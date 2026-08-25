# Accepted residuals — Cycle-4 / v2.2.0

Residuals after Blue closes must-close items on `remediation/v2.2.0`.  
Companion: [v2.2.0-remediation.md](v2.2.0-remediation.md) · [blue-team-plan.md](blue-team-plan.md)

| ID | Residual | Disposition | Notes |
|----|----------|-------------|--------|
| **C4-R01** | Demo accounts use predictable `RolePass123!` pattern | **Accepted (lab)** | Documented in demo-users; pattern spray was Red path. Optional harden → future SoftDev / Bucket B |
| **C4-R02** | `docker-compose.ssh.yml` overlay still in repo | **Accepted + policy** | For replaying `v1.2.0` / teaching. Default prod must not publish `:2222` (`assert-ssh-unpublished.sh`) |
| **C4-R03** | Loopback HTTP `:8080` day-to-day | **Accepted** | Same as Cycle-2 R-01; LAN demos → TLS overlay |
| **C4-R04** | Cycle-4 flags / SSH plants on `ctf/v1.2.0` | **Intentional archive** | Do not port secret plants onto `v2.2.0` tip |

Statuses locked at M4 gate (2026-08-25).

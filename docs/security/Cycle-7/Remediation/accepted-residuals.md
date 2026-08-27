# Accepted residuals — Cycle-7 / v2.4.0

Residuals after Blue closes must-close items on `remediation/v2.4.0`.  
Companion: [v2.4.0-remediation.md](v2.4.0-remediation.md) · [blue-team-plan.md](blue-team-plan.md)

| ID | Residual | Disposition | Notes |
|----|----------|-------------|--------|
| **C7-R01** | Loopback HTTP `:8080` day-to-day | **Accepted** | Same lineage as prior R-01; LAN / recruiter demos → TLS overlay `:8443` |
| **C7-R02** | `docker-compose.cycle7.yml` plant overlay | **Accepted (archive)** | Lives on **`ctf/v1.4.0` / tag `v1.4.0`** only — retired from tip; never default prod |
| **C7-R03** | Cowrie / dual-SSH decoy design (C7-F06) | **Accepted (archive realism)** | Not graded on secure tip once unpublished |
| **C7-R04** | Cycle-7 flags / plants on `ctf/v1.4.0` | **Intentional archive** | Do not port `OS{` plants onto `v2.4.0` tip |
| **C7-R05** | Demo `RolePass123!` / lab password patterns | **Accepted (lab)** | Unchanged from prior cycles |
| **C7-R06** | Ops Documents still serves handbook under library root | **Accepted (product)** | Feature kept; confinement is the control |

Statuses finalized at M4 gate (**2026-08-27**).

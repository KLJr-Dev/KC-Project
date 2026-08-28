# Accepted residuals — Cycle-8 / `v2.5.0`

Residuals after Blue closes must-close items on `remediation/v2.5.0`.  
Companion: [v2.5.0-remediation.md](v2.5.0-remediation.md) · [blue-team-plan.md](blue-team-plan.md)

| ID | Residual | Disposition | Notes |
|----|----------|-------------|--------|
| **C8-R01** | Loopback HTTP `:8080` day-to-day | **Accepted** | Same lineage as C7-R01; LAN / recruiter demos → TLS overlay `:8443` |
| **C8-R02** | `docker-compose.cycle8.yml` plant overlay | **Accepted (archive)** | Lives on **`ctf/v1.5.0` / tag `v1.5.0`** only — retired from tip; never default prod |
| **C8-R03** | Cowrie `:22` decoy (C8-F06) | **Accepted (archive realism)** | Not graded on secure tip once unpublished |
| **C8-R04** | Cycle-8 flags / plants on `ctf/v1.5.0` | **Intentional archive** | Do not port `OS{` plants onto `v2.5.0` tip |
| **C8-R05** | Demo / lab password patterns in product UI | **Accepted (lab)** | Unchanged from prior cycles |
| **C8-R06** | Northwind corporate skin on both tips | **Accepted (product)** | ADR-037 — skin kept; plants removed |
| **C8-R07** | FastAPI Intake as internal microservice | **Accepted (architecture)** | Hardened, not removed — edge remains Nest/nginx |

Statuses to be finalized at M4 gate.

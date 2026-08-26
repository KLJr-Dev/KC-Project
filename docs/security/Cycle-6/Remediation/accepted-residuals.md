# Accepted residuals — Cycle-6 / v2.3.0

Residuals after Blue closes must-close items on `remediation/v2.3.0`.  
Companion: [v2.3.0-remediation.md](v2.3.0-remediation.md) · [blue-team-plan.md](blue-team-plan.md)

| ID | Residual | Disposition | Notes |
|----|----------|-------------|--------|
| **C6-R01** | Loopback HTTP `:8080` day-to-day | **Accepted** | Same lineage as prior R-01; LAN / recruiter demos → TLS overlay `:8443` |
| **C6-R02** | Preview may still return title/snippet for **allowed** URLs | **Accepted (product)** | Enum aid only mattered with open SSRF; F01 close is the control |
| **C6-R03** | CORS `Allow-Credentials` for cookie auth UX | **Accepted (lab/product)** | Document; no cross-site bookmark CSRF once CSRF header required |
| **C6-R04** | Cycle-6 flags / open-fetch plants on `ctf/v1.3.0` | **Intentional archive** | Do not port `OS{` plants onto `v2.3.0` tip |
| **C6-R05** | Demo `RolePass123!` pattern | **Accepted (lab)** | Unchanged from prior cycles |

Statuses locked at M4 gate (2026-08-26).

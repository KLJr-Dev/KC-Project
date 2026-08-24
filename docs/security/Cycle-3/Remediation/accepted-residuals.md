# Accepted residuals — Cycle-3 (post leak-crack-db Blue)

Companion to [cycle-3-leak-crack-db-remediation.md](cycle-3-leak-crack-db-remediation.md).  
Cycle-2 Bucket A still applies: [../../Cycle-2/Remediation/accepted-residuals-v2.1.0.md](../../Cycle-2/Remediation/accepted-residuals-v2.1.0.md).

| ID | Residual | Rationale | Mitigation |
|----|----------|-----------|------------|
| **R-01** (carry) | Loopback HTTP `:8080` | Lab DX | TLS overlay for LAN; C3-F04 maps here |
| **C3-R01** | File search (`q`) not a product feature on secure | Avoid unused surface | SoftDev may add **parameterized** search later; never concat |
| **C3-R02** | CTF plant / SQLi / published PG exist only on `ctf/leak-crack-db` | Intentional lab | Overlay + freeze; regression e2e on secure |
| **C3-R03** | RLS tier split (C3-F06) | CTF pedagogy | Documented; not a secure-path defect |

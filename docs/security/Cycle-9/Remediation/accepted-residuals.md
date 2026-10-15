# Accepted residuals — Cycle-9 / `v2.6.0`

Companion: [v2.6.0-remediation.md](v2.6.0-remediation.md) · [gap-closure](../Dev/v1.6.0-gap-closure.md)

| ID | Item | Rationale |
|----|------|-----------|
| C9-R01 | HTTP `:8080` / no HSTS on HTTP profile | Lab transport; TLS-default → C10+ |
| C9-R02 | Sequential onboarding ids | Recon aid; authz closes IDOR impact |
| C9-R03 | Open self-registration / demo passwords | Lab UX residual |
| C9-R04 | Access JWT in JS memory | Platform residual; CSP weak |
| C9-R05 | JWT PEMs in repo / compose mounts | Lab key story |
| C9-R06 | Honeypot `/v1/internal/debug` still present | Decoy retained; no graded flag |

Wave B items (DB least-privilege, rate limits, default-password assert) tracked in gap-closure — land before tag if timeboxed; otherwise document here.

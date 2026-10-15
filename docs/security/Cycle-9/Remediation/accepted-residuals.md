# Accepted residuals — Cycle-9 / `v2.6.0`

Companion: [v2.6.0-remediation.md](v2.6.0-remediation.md) · [gap-closure](../Dev/v1.6.0-gap-closure.md)

| ID | Item | Disposition | Notes |
|----|------|-------------|-------|
| C9-R01 | HTTP `:8080` / no HSTS on HTTP profile | Accepted | TLS-default → C10+; use TLS overlay for recruiter demos |
| C9-R02 | Sequential onboarding ids | Accepted | Recon aid; authz closes IDOR impact |
| C9-R03 | Open self-registration / demo passwords | Accepted | Lab UX |
| C9-R04 | Access JWT in JS memory / CSP `unsafe-*` | Accepted | Platform residual |
| C9-R05 | JWT PEMs in repo; lab `.env` weak defaults | Accepted | `assert-no-default-secrets.sh` warn-only unless `REQUIRE_STRONG_SECRETS=1` |
| C9-R06 | Seed re-apply on every Intake start | Accepted | Lab reset convenience |
| C9-R07 | Direct Intake reachable on `edge` from backend only | Accepted | `dbnet` internal; nginx never proxies Intake direct |
| C9-R08 | Docker Secrets / RO rootfs / strict CSP / demo strip | Deferred | Cycle-10+ |

Finalized with Wave B on `remediation/v2.6.0`.

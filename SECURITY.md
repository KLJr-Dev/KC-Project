# Security Policy

KC-Project is a portfolio / learning lab: insecure-by-design releases and CTF
branches exist on purpose. Please read scope before filing a report.

## In scope

Unexpected vulnerabilities on the **hardened tip**:

- Branch `main`
- Secure product tags (`v2.x.x`)

Prefer [GitHub private vulnerability reporting](https://github.com/KLJr-Dev/KC-Project/security/advisories/new)
when available; otherwise open a private discussion with the maintainer.

Include: affected ref/tag, repro steps, impact, and (if useful) a minimal PoC.

## Out of scope

Do **not** report intentional lab findings as security issues:

- Insecure SoftDev tags (`v1.x.x`)
- Frozen CTF branches (`ctf/*`) and their documented vulns
- Demo credentials, seeded flags, and documented ground-truth chains
- Issues that only reproduce with optional lab overlays (e.g. SSH compose files)
  when the default secure tip does not expose them

Those surfaces are teaching material — see [docs/security/README.md](docs/security/README.md).

## Expectation

This is a solo educational repo, not a production SaaS. Reports on the hardened
tip are welcome; response time is best-effort.

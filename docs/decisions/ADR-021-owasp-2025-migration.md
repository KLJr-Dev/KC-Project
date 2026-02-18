# ADR-021: Migrate to OWASP Top 10:2025

## Status

Accepted

## Context

All CWE annotations and documentation in KC-Project referenced the OWASP Top 10:2021 edition. The OWASP Top 10:2025 was officially released at the OWASP Global AppSec Conference in November 2025. The 2025 edition is now the current authoritative reference for web application security risks.

Several categories were renumbered and two new categories were introduced. Continuing to reference 2021 would make the project's security documentation increasingly stale.

## Decision

Migrate all OWASP Top 10 references from 2021 to 2025 as part of v0.2.3. This is a mechanical replacement across source code VULN annotations, documentation tables, threat models, and diagrams.

## Mapping

| 2021 | 2025 | Notes |
|------|------|-------|
| A01:2025 Broken Access Control | A01:2025 Broken Access Control | Same position. SSRF (A01:2025) folded in. |
| A04:2025 Cryptographic Failures | A04:2025 Cryptographic Failures | Dropped from #2 to #4. |
| A05:2025 Injection | A05:2025 Injection | Dropped from #3 to #5. |
| A06:2025 Insecure Design | A06:2025 Insecure Design | Dropped from #4 to #6. |
| A02:2025 Security Misconfiguration | A02:2025 Security Misconfiguration | Rose from #5 to #2. |
| A03:2025 Vulnerable and Outdated Components | A03:2025 Software Supply Chain Failures | Renamed and expanded. |
| A07:2025 Identification and Authentication Failures | A07:2025 Authentication Failures | Name shortened. |
| A08:2025 Software and Data Integrity Failures | A08:2025 Software or Data Integrity Failures | Minor name change. |
| A09:2025 Security Logging and Monitoring Failures | A09:2025 Security Logging and Alerting Failures | "Monitoring" to "Alerting". |
| A01:2025 Server-Side Request Forgery | Folded into A01:2025 | No longer a standalone category. |
| NEW | A03:2025 Software Supply Chain Failures | #1 in community survey. |
| NEW | A10:2025 Mishandling of Exceptional Conditions | Error handling and logical errors. |

## Scope

~38 files, ~290 occurrences across:

- Backend source code (VULN annotations in comments)
- Backend test files
- Frontend source code (VULN annotations)
- Documentation (tables, diagrams, threat models, STRIDE analysis)
- Infrastructure files (compose.yml comments)
- Glossary

## Approach

The A02/A05 swap (Cryptographic Failures and Security Misconfiguration exchanged positions) requires care — a naive global replace would mis-map them. The migration is done in order:

1. Replace `A02:2025` with `A02:2025` first (Misconfig)
2. Replace `A04:2025` with `A04:2025` second (Crypto)
3. Then A03, A04, A06 which don't conflict
4. A01, A07, A08, A09 change year only (same number)

## Consequences

- All OWASP references are now current (2025 edition)
- Future CWE annotations should use `A0X:2025` format
- The v2.0.0 remediation docs already reference categories by name, so they remain valid
- A10:2025 (Mishandling of Exceptional Conditions) becomes available for future error-handling vulns (v0.2.4)

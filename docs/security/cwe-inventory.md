# CWE Inventory (v1.0.0 target: 60–80)

Consolidated intentional weaknesses through v0.6.x. Count grows with Docker (v0.7) and freeze verification.

## Identity & Auth (v0.1.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-256 | Plaintext passwords | v0.1.1 |
| CWE-347 | Weak JWT secret | v0.1.3 |
| CWE-613 | No token expiry / logout noop | v0.1.4 |
| CWE-204 | User enumeration via login errors | v0.1.2 |
| CWE-307 | No rate limiting | v0.1.5 |
| CWE-521 | Weak password policy | v0.5.0 |

## Persistence & Data (v0.2.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-330 | Sequential IDs | v0.2.0 |
| CWE-639 | IDOR on users | v0.2.2 |
| CWE-200 | Full table dumps | v0.2.3 |
| CWE-203 | Existence oracle | v0.2.3 |
| CWE-209 | Error leakage | v0.2.4 |
| CWE-532 | SQL logging | v0.2.3 |

## Files & Sharing (v0.3.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-22 | Path traversal | v0.3.x |
| CWE-434 | MIME confusion | v0.3.x |
| CWE-400 | No upload limit | v0.3.x |
| CWE-330 | Predictable share tokens | v0.3.4 |
| CWE-285 | Public share no auth | v0.3.4 |
| CWE-613 | Expiry not enforced | v0.3.4 |

## Authorization (v0.4.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-639 | JWT role trusted | v0.4.0 |
| CWE-862 | Missing guards | v0.4.5 |
| CWE-269 | Privilege escalation | v0.4.4 |
| CWE-841 | Role hierarchy ambiguity | v0.4.3 |

## Refinement (v0.5.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-20 | Weak validation patterns | v0.5.0 |
| CWE-1025 | Type mismatch exposure | v0.5.0 |
| CWE-205 | Pagination offset oracle | v0.5.2 |

## Admin (v0.6.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-284 | Weak audit log guard | v0.6.0 |
| CWE-682 | Weak stats date filter | v0.6.2 |

## Infrastructure (v0.7.x)

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-798 | Hardcoded compose credentials | v0.7.0 |
| CWE-942 | Permissive CORS | v0.0.5 |

**Estimated cumulative: 35+ documented through v0.4.x, 45+ through v0.6.x, 60–80 at v1.0.0 with Docker and client-side CWEs.**

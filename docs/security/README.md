# Security & Penetration Testing Methodology (v0.8.1 draft)

## Scope

KC-Project v1.0.0 insecure MVP: full-stack web app with intentional CWEs across auth, files, sharing, RBAC, admin, and infrastructure.

## Tools

- Burp Suite / OWASP ZAP (HTTP proxy)
- curl / httpx (API probing)
- jwt_tool (JWT forgery with known secret `kc-secret`)
- Docker compose stack for deployment testing

## Entry points

| Surface | URL / path | Auth |
|---------|------------|------|
| App UI | `http://localhost:8080` | Browser + localStorage JWT |
| API (proxied) | `http://localhost:8080/api/*` | Bearer JWT |
| API (direct dev) | `http://localhost:4000/*` | Bearer JWT |
| OpenAPI | `http://localhost:4000/api/docs` | None |
| Public share | `GET /api/sharing/public/:token` | None |

## Methodology

1. Map attack surface from OpenAPI (`/api/docs`) and [cwe-inventory.md](cwe-inventory.md) (59 instances, 38 CWE IDs)
2. Authenticate as user, moderator, admin; test IDOR on sequential IDs
3. Test JWT role forgery (CWE-639) on admin and approve endpoints
4. Test file upload path traversal and MIME confusion (note: nginx blocks >1 MB before Multer)
5. Test public share token enumeration
6. Test guard inconsistencies (DELETE /admin/users/:id without HasRole)
7. Inspect bundled frontend JS for CWE-615 / CWE-922 exposure
8. Document findings with CWE + OWASP Top 10:2025 mapping

## Findings template

| ID | Endpoint | CWE | Severity | Repro steps | Remediation (v2.0.0) |
|----|----------|-----|----------|-------------|----------------------|

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [threat-model.md](../architecture/threat-model.md) (if present)
- [security-baseline.md](../spec/security-baseline.md)

# Threat Model

Complete attack surface map for v1.0.0 (insecure MVP) with dual CWE + OWASP Top 10 classification. Each weakness is intentional per the project's insecure-by-design philosophy (ADR-006). The v2.0.0 remediation map shows the specific control applied for each weakness.

---

## v1.0.0 Attack Surface Map

Approximately 20 weaknesses across 6 attack surfaces. Every weakness exists by design and will be documented, exploited, and remediated through the v1.0.x pentest cycle.

```mermaid
graph TD
  subgraph identity ["Identity Surface"]
    PlaintextPW["Plaintext/weak password storage\nCWE-256\nA07:2021"]
    WeakJWT["Weak JWT secret (HS256, hardcoded)\nCWE-347\nA02:2021"]
    NoExpiry["No token expiration\nCWE-613\nA07:2021"]
    NoRevoke["No session revocation\nCWE-613\nA07:2021"]
    UserEnum["User enumeration via error messages\nCWE-204\nA07:2021"]
    NoRateLimit["No rate limiting on auth\nCWE-307\nA07:2021"]
    LocalStorageToken["Token in localStorage\nCWE-922\nA07:2021"]
  end

  subgraph data ["Data Surface"]
    SeqIDs["Sequential predictable IDs\nCWE-330\nA01:2021"]
    IDOR["IDOR across users\nCWE-639\nA01:2021"]
    ClientIDs["Client-supplied IDs trusted\nCWE-639\nA01:2021"]
  end

  subgraph injection ["Injection Surface"]
    SQLi["SQL injection\nCWE-89\nA03:2021"]
    SQLErrors["SQL error messages exposed\nCWE-209\nA05:2021"]
  end

  subgraph files ["File Surface"]
    PathTraversal["Path traversal\nCWE-22\nA01:2021"]
    MIMEConfusion["MIME type confusion\nCWE-434\nA04:2021"]
    NoFileOwnership["No file ownership checks\nCWE-639\nA01:2021"]
    OversizedUpload["No upload size limit\nCWE-400\nA04:2021"]
    PredictableFileIDs["Predictable file identifiers\nCWE-330\nA01:2021"]
  end

  subgraph authz ["Authorization Surface"]
    ClientRoles["Client role claims trusted\nCWE-285\nA01:2021"]
    PrivEsc["Privilege escalation paths\nCWE-269\nA01:2021"]
    FEOnlyGuard["Frontend-only admin guards\nCWE-602\nA04:2021"]
    CrossUserAccess["Admin endpoints callable by users\nCWE-639\nA01:2021"]
  end

  subgraph infra ["Infrastructure Surface"]
    RootContainers["Root containers\nCWE-250\nA05:2021"]
    DefaultCreds["Default DB credentials\nCWE-798\nA07:2021"]
    AllPortsExposed["All ports exposed to internet\nCWE-668\nA05:2021"]
    NoTLS["No TLS (HTTP only)\nCWE-319\nA02:2021"]
    VerboseLogs["Sensitive data in logs\nCWE-532\nA09:2021"]
    NoNetworkSeg["No network segmentation\nCWE-668\nA05:2021"]
  end
```

---

## Weakness Reference Table

Full inventory of v1.0.0 weaknesses with classification, surface, and version traceability.

| # | Weakness | CWE | OWASP Top 10 | Surface | Introduced | Remediated |
|---|----------|-----|-------------|---------|------------|------------|
| 1 | Plaintext/weak password storage | CWE-256 | A07:2021 Identification and Authentication Failures | Identity | v0.1.1 | v2.0.0 |
| 2 | Weak JWT secret (HS256, hardcoded) | CWE-347 | A02:2021 Cryptographic Failures | Identity | v0.1.3 | v2.0.0 |
| 3 | No token expiration | CWE-613 | A07:2021 Identification and Authentication Failures | Identity | v0.1.3 | v2.0.0 |
| 4 | No session revocation | CWE-613 | A07:2021 Identification and Authentication Failures | Identity | v0.1.4 | v2.0.0 |
| 5 | User enumeration via distinct errors | CWE-204 | A07:2021 Identification and Authentication Failures | Identity | v0.1.2 | v2.0.0 |
| 6 | No rate limiting on auth endpoints | CWE-307 | A07:2021 Identification and Authentication Failures | Identity | v0.1.5 | v2.0.0 |
| 7 | Token stored in localStorage | CWE-922 | A07:2021 Identification and Authentication Failures | Identity | v0.1.1 | v2.0.0 |
| 8 | Sequential predictable user IDs | CWE-330 | A01:2021 Broken Access Control | Data | v0.1.0 | v2.0.0 |
| 9 | IDOR across users (ownership not checked) | CWE-639 | A01:2021 Broken Access Control | Data | v0.2.2 | v2.0.0 |
| 10 | Client-supplied IDs trusted | CWE-639 | A01:2021 Broken Access Control | Data | v0.2.2 | v2.0.0 |
| 11 | SQL injection | CWE-89 | A03:2021 Injection | Injection | v0.2.1 | v2.0.0 |
| 12 | SQL error messages exposed to client | CWE-209 | A05:2021 Security Misconfiguration | Injection | v0.2.4 | v2.0.0 |
| 13 | Path traversal in file access | CWE-22 | A01:2021 Broken Access Control | File | v0.3.5 | v2.0.0 |
| 14 | MIME type confusion on upload | CWE-434 | A04:2021 Insecure Design | File | v0.3.5 | v2.0.0 |
| 15 | No file ownership checks | CWE-639 | A01:2021 Broken Access Control | File | v0.3.2 | v2.0.0 |
| 16 | No upload size limit | CWE-400 | A04:2021 Insecure Design | File | v0.3.5 | v2.0.0 |
| 17 | Client role claims trusted by backend | CWE-285 | A01:2021 Broken Access Control | Authorization | v0.4.2 | v2.0.0 |
| 18 | Privilege escalation paths | CWE-269 | A01:2021 Broken Access Control | Authorization | v0.4.3 | v2.0.0 |
| 19 | Frontend-only admin guards | CWE-602 | A04:2021 Insecure Design | Authorization | v0.4.2 | v2.0.0 |
| 20 | Admin endpoints callable by regular users | CWE-639 | A01:2021 Broken Access Control | Authorization | v0.4.4 | v2.0.0 |
| 21 | Root containers | CWE-250 | A05:2021 Security Misconfiguration | Infrastructure | v0.5.0 | v2.0.0 |
| 22 | Default database credentials | CWE-798 | A07:2021 Identification and Authentication Failures | Infrastructure | v0.2.0 | v2.0.0 |
| 23 | All ports exposed to internet | CWE-668 | A05:2021 Security Misconfiguration | Infrastructure | v0.5.0 | v2.0.0 |
| 24 | No TLS (HTTP plaintext) | CWE-319 | A02:2021 Cryptographic Failures | Infrastructure | v0.5.0 | v2.0.0 |
| 25 | Sensitive data in logs | CWE-532 | A09:2021 Security Logging and Monitoring Failures | Infrastructure | v0.6.2 | v2.0.0 |
| 26 | No network segmentation | CWE-668 | A05:2021 Security Misconfiguration | Infrastructure | v0.5.2 | v2.0.0 |

---

## OWASP Top 10 Coverage

How the v1.0.0 attack surface maps to the OWASP Top 10 (2021):

| OWASP Category | Count | Weaknesses |
|----------------|-------|------------|
| A01:2021 Broken Access Control | 9 | Sequential IDs, IDOR, client IDs trusted, path traversal, no file ownership, client roles trusted, privilege escalation, FE-only guards, admin endpoints open |
| A02:2021 Cryptographic Failures | 3 | Weak JWT secret, no TLS, (password storage overlaps A07) |
| A03:2021 Injection | 1 | SQL injection |
| A04:2021 Insecure Design | 3 | MIME confusion, no upload size limit, frontend-only guards |
| A05:2021 Security Misconfiguration | 4 | SQL error leakage, root containers, all ports exposed, no network segmentation |
| A07:2021 Identification and Authentication Failures | 7 | Plaintext passwords, no expiry, no revocation, user enumeration, no rate limiting, localStorage tokens, default DB credentials |
| A09:2021 Security Logging and Monitoring Failures | 1 | Sensitive data in logs |

---

## v2.0.0 Remediation Map

Same 6 surfaces, each weakness replaced with the specific control applied. The delta between v1.0.0 and v2.0.0 is the security education.

```mermaid
graph TD
  subgraph identity ["Identity Surface -- Hardened"]
    BcryptPW["bcrypt cost 12\nCWE-256 remediated"]
    RS256JWT["RS256 asymmetric keys, rotated\nCWE-347 remediated"]
    ShortExpiry["15min access token + refresh rotation\nCWE-613 remediated"]
    ServerRevoke["Refresh token table, deleted on logout\nCWE-613 remediated"]
    GenericErrors["Generic 'Authentication failed' message\nCWE-204 remediated"]
    RateLimiting["nginx rate limiting + per-IP throttle\nCWE-307 remediated"]
    HttpOnlyCookie["httpOnly secure sameSite cookie\nCWE-922 remediated"]
  end

  subgraph data ["Data Surface -- Hardened"]
    UUIDs["UUIDv4 for all identifiers\nCWE-330 remediated"]
    OwnershipChecks["Server-side ownership validation\nCWE-639 remediated"]
    ServerIDs["Server-generated IDs only\nCWE-639 remediated"]
  end

  subgraph injection ["Injection Surface -- Hardened"]
    ParamQueries["Parameterised queries (ORM)\nCWE-89 remediated"]
    GenericDBErrors["Generic error responses, no SQL traces\nCWE-209 remediated"]
  end

  subgraph files ["File Surface -- Hardened"]
    PathValidation["Path canonicalisation + chroot\nCWE-22 remediated"]
    MIMEValidation["Content-type validation + magic bytes\nCWE-434 remediated"]
    FileOwnership["Ownership check on every access\nCWE-639 remediated"]
    SizeLimits["Upload size limits enforced\nCWE-400 remediated"]
  end

  subgraph authz ["Authorization Surface -- Hardened"]
    ServerRoles["Server-side RBAC from DB\nCWE-285 remediated"]
    LeastPrivilege["Principle of least privilege enforced\nCWE-269 remediated"]
    BackendGuards["Backend guards on all admin routes\nCWE-602 remediated"]
    RBACEnforced["RBAC enforced on every endpoint\nCWE-639 remediated"]
  end

  subgraph infra ["Infrastructure Surface -- Hardened"]
    NonRootContainers["Non-root containers, read-only FS\nCWE-250 remediated"]
    StrongCreds["Strong credentials via Docker secrets\nCWE-798 remediated"]
    NginxOnly["Only port 443 exposed via nginx\nCWE-668 remediated"]
    TLSEnabled["TLS termination, HSTS header\nCWE-319 remediated"]
    RedactedLogs["Structured logs, sensitive fields redacted\nCWE-532 remediated"]
    InternalNetwork["Custom internal Docker network\nCWE-668 remediated"]
  end
```

---

## Remediation Detail Table

| # | v1.0.0 Weakness | v2.0.0 Control | Implementation |
|---|-----------------|---------------|----------------|
| 1 | Plaintext/weak passwords | bcrypt cost 12 | `bcrypt.hash(password, 12)` before INSERT |
| 2 | Weak JWT (HS256, hardcoded) | RS256 asymmetric keys | Private key signs, public key verifies, keys rotated |
| 3 | No token expiration | 15-minute access tokens | `jwt.sign({ sub }, key, { expiresIn: "15m" })` |
| 4 | No session revocation | Refresh token table | `refresh_tokens` table, deleted on logout, rotated on refresh |
| 5 | Distinct auth errors | Generic messages | All auth failures return "Authentication failed" |
| 6 | No rate limiting | nginx + app-level throttle | `limit_req_zone` in nginx, `@nestjs/throttler` in backend |
| 7 | localStorage tokens | httpOnly cookies | Refresh token in `Set-Cookie: httpOnly; secure; sameSite=strict` |
| 8 | Sequential IDs | UUIDv4 | `uuid_generate_v4()` in PostgreSQL, no sequential integers |
| 9 | IDOR (no ownership check) | Ownership validation | `WHERE id = $1 AND owner_id = $2` on every query |
| 10 | Client IDs trusted | Server-generated IDs | IDs generated server-side only, client values ignored |
| 11 | SQL injection | Parameterised queries | TypeORM with query parameters, no string concatenation |
| 12 | SQL errors exposed | Generic errors | Global exception filter strips internal details |
| 13 | Path traversal | Canonicalisation + chroot | `path.resolve()` + base directory validation |
| 14 | MIME confusion | Content-type + magic bytes | Validate MIME via file header, not client Content-Type |
| 15 | No file ownership | Ownership check | `files.owner_id = currentUser.id` on read/delete |
| 16 | No upload size limit | Multer limits | `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB) |
| 17 | Client roles trusted | Server RBAC | Role from DB `users.role`, never from request body/token |
| 18 | Privilege escalation | Least privilege | Guards check `role >= required` on every route |
| 19 | FE-only admin guards | Backend guards | `@Roles('admin')` decorator + `RolesGuard` |
| 20 | Admin endpoints open | RBAC on all routes | Every admin route guarded, 403 for non-admin |
| 21 | Root containers | Non-root, read-only | `USER node` in Dockerfile, `read_only: true` in compose |
| 22 | Default DB credentials | Docker secrets | `POSTGRES_PASSWORD_FILE=/run/secrets/db_password` |
| 23 | All ports exposed | nginx only | Only `443:443` mapped; backend/DB on internal network |
| 24 | No TLS | TLS + HSTS | nginx TLS termination, `Strict-Transport-Security` header |
| 25 | Sensitive data in logs | Redacted structured logs | Pino/Winston with field-level redaction rules |
| 26 | No network segmentation | Custom Docker network | `networks: internal` with no external gateway for DB |

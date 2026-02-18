# STRIDE Threat Model

STRIDE analysis mapped to the 6 attack surfaces defined in [threat-model.md](../diagrams/threat-model.md). This adds a formal threat categorisation methodology on top of the existing CWE + OWASP Top 10 classification.

STRIDE was developed by Microsoft and categorises threats into six types:

- **S**poofing -- Pretending to be something or someone else
- **T**ampering -- Modifying data or code without authorisation
- **R**epudiation -- Denying actions without the system being able to prove otherwise
- **I**nformation Disclosure -- Exposing information to unauthorised parties
- **D**enial of Service -- Making the system unavailable or degraded
- **E**levation of Privilege -- Gaining capabilities beyond what is authorised

---

## STRIDE per Attack Surface (v1.0.0)

### Identity Surface

| STRIDE | Threat | CWE | OWASP |
|--------|--------|-----|-------|
| **Spoofing** | Forge JWTs using weak hardcoded secret | CWE-347 | A04:2025 |
| **Spoofing** | Enumerate valid users via distinct error messages | CWE-204 | A07:2025 |
| **Spoofing** | Brute-force credentials with no rate limiting | CWE-307 | A07:2025 |
| **Tampering** | Modify JWT payload (change `sub` to another user ID) | CWE-347 | A04:2025 |
| **Repudiation** | No audit log of login attempts, registrations, or logouts | CWE-778 | A09:2025 |
| **Info Disclosure** | JWT payload is base64-encoded, readable by anyone | CWE-319 | A04:2025 |
| **Info Disclosure** | Distinct error messages reveal which emails are registered | CWE-204 | A07:2025 |
| **Info Disclosure** | Tokens stored in localStorage, accessible to any JS on the page | CWE-922 | A07:2025 |
| **DoS** | Unlimited login attempts allow credential stuffing at scale | CWE-307 | A07:2025 |
| **EoP** | Replay token after logout (no server-side revocation) | CWE-613 | A07:2025 |
| **EoP** | Tokens never expire -- stolen token grants indefinite access | CWE-613 | A07:2025 |

### Data Surface

| STRIDE | Threat | CWE | OWASP |
|--------|--------|-----|-------|
| **Spoofing** | Access another user's data by guessing sequential IDs | CWE-639 | A01:2025 |
| **Tampering** | Modify other users' resources via IDOR (no ownership check) | CWE-639 | A01:2025 |
| **Tampering** | Client-supplied IDs accepted without validation | CWE-639 | A01:2025 |
| **Repudiation** | No data change audit log (who modified what, when) | CWE-778 | A09:2025 |
| **Info Disclosure** | Sequential IDs reveal total count and allow enumeration | CWE-330 | A01:2025 |
| **Info Disclosure** | IDOR allows reading data belonging to other users | CWE-639 | A01:2025 |
| **DoS** | No query limits or pagination -- request all records | CWE-400 | A02:2025 |

### Injection Surface

| STRIDE | Threat | CWE | OWASP |
|--------|--------|-----|-------|
| **Tampering** | SQL injection to modify or delete data | CWE-89 | A05:2025 |
| **Info Disclosure** | SQL injection to extract data from other tables | CWE-89 | A05:2025 |
| **Info Disclosure** | Raw SQL error messages returned to client | CWE-209 | A02:2025 |
| **DoS** | Resource-heavy SQL queries via injection | CWE-89 | A05:2025 |

### File Surface

| STRIDE | Threat | CWE | OWASP |
|--------|--------|-----|-------|
| **Spoofing** | Upload file with misleading MIME type (e.g. executable as image) | CWE-434 | A06:2025 |
| **Tampering** | Path traversal to overwrite files outside upload directory | CWE-22 | A01:2025 |
| **Tampering** | Modify file metadata belonging to other users (IDOR) | CWE-639 | A01:2025 |
| **Repudiation** | No file access log (who downloaded/deleted what) | CWE-778 | A09:2025 |
| **Info Disclosure** | Access files owned by other users via sequential file IDs | CWE-639 | A01:2025 |
| **Info Disclosure** | Path traversal to read arbitrary server files | CWE-22 | A01:2025 |
| **Info Disclosure** | Predictable sharing tokens allow access to shared files | CWE-330 | A01:2025 |
| **DoS** | Upload extremely large files (no size limit) | CWE-400 | A06:2025 |
| **EoP** | Access admin-only files without admin role | CWE-639 | A01:2025 |

### Authorisation Surface

| STRIDE | Threat | CWE | OWASP |
|--------|--------|-----|-------|
| **Spoofing** | Spoof role claim (backend trusts client-supplied role) | CWE-285 | A01:2025 |
| **Tampering** | Modify own role via API (no server-side validation) | CWE-269 | A01:2025 |
| **Repudiation** | No audit log of admin actions (role changes, user management) | CWE-778 | A09:2025 |
| **Info Disclosure** | Admin endpoints return data to non-admin users | CWE-639 | A01:2025 |
| **EoP** | Regular user calls admin endpoints (no backend guard) | CWE-602 | A06:2025 |
| **EoP** | Frontend hides admin UI but backend doesn't enforce | CWE-602 | A06:2025 |
| **EoP** | Self-promote to admin via role modification endpoint | CWE-269 | A01:2025 |

### Infrastructure Surface

| STRIDE | Threat | CWE | OWASP |
|--------|--------|-----|-------|
| **Spoofing** | Connect to database with default credentials (postgres/postgres) | CWE-798 | A07:2025 |
| **Tampering** | Modify database directly via exposed port 5432 | CWE-668 | A02:2025 |
| **Tampering** | Container escape from root container to host | CWE-250 | A02:2025 |
| **Repudiation** | Logs contain sensitive data but lack structure for forensics | CWE-532 | A09:2025 |
| **Info Disclosure** | All ports exposed, services discoverable via port scan | CWE-668 | A02:2025 |
| **Info Disclosure** | Sensitive data (passwords, tokens) in application logs | CWE-532 | A09:2025 |
| **Info Disclosure** | No TLS -- network traffic readable in plaintext | CWE-319 | A04:2025 |
| **DoS** | No container resource limits -- exhaust host CPU/memory | CWE-770 | A02:2025 |
| **EoP** | Root containers allow privilege escalation on host | CWE-250 | A02:2025 |

---

## STRIDE Summary Matrix

High-level view: which STRIDE categories apply to which surfaces.

| | Identity | Data | Injection | File | Authorization | Infrastructure |
|---|---|---|---|---|---|---|
| **Spoofing** | JWT forgery, enumeration, brute-force | IDOR | -- | MIME spoofing | Role claim spoofing | Default credentials |
| **Tampering** | Token payload modification | Client IDs, IDOR writes | SQL injection | Path traversal, IDOR | Self role modification | Direct DB access, container escape |
| **Repudiation** | No auth event logging | No change logs | No query logs | No file access logs | No admin action logs | Unstructured logs |
| **Info Disclosure** | JWT payload, error messages, localStorage | Sequential IDs, IDOR reads | SQL errors | File IDOR, share tokens, traversal reads | Admin data to users | Ports, logs, plaintext traffic |
| **DoS** | Unlimited auth attempts | No query limits | Heavy queries | Oversized uploads | -- | No resource limits |
| **EoP** | Token replay, no expiry | Ownership bypass | -- | Cross-user file access | FE-only guards, self-promote | Root containers |

---

## STRIDE Coverage by CWE

Which CWEs from [threat-model.md](../diagrams/threat-model.md) map to each STRIDE category:

| STRIDE | CWEs Covered |
|--------|-------------|
| Spoofing | CWE-204, CWE-307, CWE-347, CWE-434, CWE-639, CWE-798 |
| Tampering | CWE-22, CWE-89, CWE-269, CWE-347, CWE-639, CWE-668 |
| Repudiation | CWE-778 (new -- not in original threat model, applies across all surfaces) |
| Information Disclosure | CWE-200, CWE-204, CWE-209, CWE-319, CWE-330, CWE-532, CWE-639, CWE-668, CWE-922 |
| Denial of Service | CWE-307, CWE-400, CWE-770 |
| Elevation of Privilege | CWE-250, CWE-269, CWE-285, CWE-602, CWE-613, CWE-639 |

Note: CWE-778 (Insufficient Logging) was identified through STRIDE analysis (Repudiation category) and is not in the original threat model. It applies to all 6 surfaces and should be added as weakness #27 in the threat model when it is next updated.

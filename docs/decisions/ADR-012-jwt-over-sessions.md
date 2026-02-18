# ADR-012: JWT Over Server-Side Sessions

**Status:** Accepted

**Date:** v0.1.3 (Session Concept)

---

## Context

v0.1.3 introduces the "session concept" — replacing stub tokens with real, verifiable tokens. The backend needs a mechanism to identify authenticated users on subsequent requests after login.

Options considered:

- **JWT (JSON Web Tokens)** — Stateless. Token contains the payload (user ID), signed with a secret. Backend verifies the signature without storing session state. Widely used in SPAs.
- **Server-side sessions** — Stateful. Server stores session data (in memory, Redis, or DB). Client receives an opaque session ID (usually in a cookie). Server looks up the session on each request.
- **Opaque bearer tokens** — Random string stored in a server-side lookup table. Similar to sessions but sent as a Bearer header rather than a cookie.

## Decision

Use **JWT (HS256)** with a hardcoded weak secret and no expiration for v0.1.3.

Rationale:

1. **No server-side state needed** — The project has no database yet (v0.2.x) and no Redis. JWTs are self-contained — the backend verifies the token using only the secret key, with no session store to manage.
2. **Transparent payload** — JWT payloads are base64-encoded, not encrypted. Anyone can decode `{ sub: "1" }` from the token. This is a deliberate security surface: an attacker can read user IDs, understand the token structure, and attempt forgery if they discover the secret.
3. **Forgery attack surface** — HS256 with a weak, hardcoded secret (e.g. `"kc-secret"`) is brute-forceable. This creates a realistic attack path for penetration testing: discover the secret → forge tokens for any user.
4. **No expiration surface** — JWTs support an `exp` claim, but omitting it means tokens are valid forever (CWE-613). This is an intentional weakness that will be remediated in v2.0.0 with short-lived access tokens.
5. **Replay surface** — Without server-side session tracking, there's no way to invalidate a JWT after logout. The token remains valid indefinitely (CWE-613). This enables token replay attacks.

Server-side sessions were rejected because they require a storage backend (memory map, Redis, or database) that doesn't exist yet. They would also hide the token contents from the attacker, reducing the attack surface available for learning.

## Token Specification (v0.1.3)

| Property | Value |
|----------|-------|
| Algorithm | HS256 (symmetric) |
| Secret | Hardcoded string (e.g. `"kc-secret"`) |
| Payload | `{ sub: userId }` |
| Expiration | None (no `exp` claim) |
| Issued-at | Optional `iat` (auto-added by library) |
| Storage | localStorage (per ADR-009) |
| Transport | `Authorization: Bearer <token>` header |

## Security Weaknesses (Intentional)

| Weakness | CWE | OWASP Top 10 |
|----------|-----|-------------|
| Weak hardcoded secret | CWE-347 | A04:2025 Cryptographic Failures |
| No token expiration | CWE-613 | A07:2025 Identification and Authentication Failures |
| No server-side revocation | CWE-613 | A07:2025 Identification and Authentication Failures |
| Symmetric algorithm (forgery if secret known) | CWE-347 | A04:2025 Cryptographic Failures |
| Payload readable (base64, not encrypted) | CWE-319 | A04:2025 Cryptographic Failures |

## v2.0.0 Remediation

The secure counterpart will use:

- RS256 (asymmetric) — private key signs, public key verifies
- Short-lived access tokens (15 min) with refresh token rotation
- Refresh tokens stored server-side, deleted on logout
- httpOnly secure cookies for refresh tokens
- Access tokens kept in memory only (not localStorage)

## Consequences

- **Positive:** Zero infrastructure requirements. Works with the existing in-memory backend.
- **Positive:** Rich attack surface for pentesting: token forgery, replay, no-expiry abuse, payload inspection.
- **Positive:** The transition from weak JWT to secure JWT+refresh in v2.0.0 demonstrates a real-world hardening pattern.
- **Positive:** Frontend can decode the token client-side (useful for debugging and for attackers).
- **Negative:** No way to revoke tokens server-side. Logout is cosmetic (client deletes token, but it remains valid).
- **Negative:** If the secret leaks (and it will — it's hardcoded), any user can forge tokens for any other user.

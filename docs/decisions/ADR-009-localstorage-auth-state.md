# ADR-009: localStorage for Client-Side Auth State

**Status:** Accepted

**Date:** v0.1.1 (Registration Endpoint)

---

## Context

After registration or login, the frontend receives an auth token and user ID. These need to be stored client-side so the user stays "logged in" across page navigations and browser refreshes.

Options considered:

- **localStorage** — Persistent key-value store. Survives page reload and browser close. Accessible to any JavaScript on the same origin.
- **sessionStorage** — Same API as localStorage but scoped to the browser tab. Cleared when the tab closes.
- **httpOnly cookie** — Set by the server via `Set-Cookie` header. Not accessible to JavaScript. Sent automatically on every request to the same origin.
- **In-memory only (React state)** — Token lives in React context. Lost on page refresh.

## Decision

Use **localStorage** to persist auth state (`token` and `userId`) under the key `kc_auth`.

The `AuthContext` provider reads from localStorage on mount (`useEffect`) and writes on login/logout. The token is stored as a plain JSON object: `{ token: string, userId: string }`.

This is **intentionally insecure**:

1. **XSS-accessible (CWE-922)** — Any JavaScript running on the page (including injected scripts) can read `localStorage.getItem('kc_auth')` and exfiltrate the token. This is the primary weakness.
2. **No expiry enforcement** — localStorage has no built-in TTL. The token sits there indefinitely unless explicitly removed.
3. **No secure/httpOnly flags** — Unlike cookies, localStorage entries have no transport or access restrictions.

This aligns with ADR-006 (insecure-by-design). The secure counterpart in v2.0.0 will use httpOnly cookies for refresh tokens and keep short-lived access tokens in memory only.

## Consequences

- **Positive:** Simple implementation — `JSON.stringify` / `JSON.parse` with `getItem` / `setItem`.
- **Positive:** Token survives page refresh, giving a realistic "stay logged in" UX.
- **Positive:** Creates a real XSS → token theft attack path for penetration testing (v1.0.0+).
- **Positive:** The migration from localStorage to httpOnly cookies in v2.0.0 will be a concrete, demonstrable security improvement.
- **Negative:** Any XSS vulnerability gives the attacker full access to the auth token. This is intentional.
- **Negative:** Token persists after "logout" if `localStorage.removeItem` fails silently. Edge case, but real.

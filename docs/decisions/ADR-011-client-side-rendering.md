# ADR-011: Client-Side Rendering Only (Intentionally Insecure)

**Status:** Accepted (v0.0.4) — to be partially superseded in v2.x

**Date:** v0.0.4 (Frontend Bootstrapping)

---

## Context

Next.js App Router defaults to React Server Components (RSC). Components are server-rendered unless explicitly marked with `'use client'`. KC-Project's frontend needs to make authenticated API calls, manage client-side state (auth context, theme context), and handle form interactions — all of which require client-side JavaScript.

The question: should we use RSC where possible and only opt into `'use client'` for interactive parts, or should we go fully client-rendered?

## Decision

**All page components use `'use client'` during v0.x and v1.0.0**. The entire application renders client-side. This is an **intentional security weakness**, not just a simplicity choice.

### Why CSR is the insecure choice

When everything runs client-side, everything is exposed to the browser. An attacker (or any user) can:

- **Inspect network traffic** — Every API call is visible in DevTools Network tab. Request/response bodies, headers, auth tokens, error messages — all readable.
- **Read tokens from storage** — JWTs in localStorage are accessible via the DevTools console (`localStorage.getItem('kc_auth')`). Any XSS payload can exfiltrate them.
- **Observe application state** — React DevTools exposes the full component tree, context values, and state. Auth state, user data, and role information are all inspectable.
- **Manipulate requests** — Since API calls originate from the browser, they can be intercepted, replayed, or modified using browser tools or proxies (Burp Suite, OWASP ZAP).
- **View client-side logic** — Route guards, role checks, and form validation all happen in JavaScript that the user can read and bypass.

Server-rendered pages would hide much of this surface. Data fetched server-side never touches the browser. Tokens stored in httpOnly cookies are invisible to JavaScript. Server-side route guards can't be bypassed by the client.

### Why we still chose CSR for v1.0.0

1. **Maximises attack surface** — Aligns with ADR-006 (insecure-by-design). The more that runs in the browser, the more an attacker can see and manipulate.
2. **Auth state is client-side** — `AuthContext` uses `useState`, `useEffect`, and `localStorage`. These are client-only APIs.
3. **API calls happen in the browser** — `lib/api.ts` uses `fetch` from the browser to call the backend. No BFF layer.
4. **Simpler for the build phase** — During v0.x, we're iterating on shape and behaviour. CSR avoids the complexity of server/client component boundaries until we're ready.

## v2.x Hardening Path

In v2.x (secure counterparts), parts of the application will move to server-side rendering:

- **Server Components for data display** — Pages that fetch and display data (user lists, file metadata, admin panels) can use RSC. The data never reaches the browser as raw API responses.
- **Server Actions for mutations** — Form submissions can use Next.js Server Actions, keeping request logic server-side.
- **BFF pattern** — The Next.js server can act as a backend-for-frontend, proxying API calls and attaching auth tokens server-side. The browser never sees the raw token.
- **httpOnly cookies** — Auth tokens move from localStorage to httpOnly cookies (per ADR-009's remediation path). The Next.js server reads them; the browser cannot.

Not everything moves server-side — interactive components (forms, theme toggles, real-time features) will remain `'use client'`. The hardening is about moving **sensitive data handling** off the client, not eliminating client components entirely.

## Security Weaknesses (Intentional)

| Weakness | CWE | OWASP Top 10 |
|----------|-----|-------------|
| Auth tokens visible in browser storage | CWE-922 | A07:2025 Authentication Failures |
| API responses visible in network tab | CWE-200 | A01:2025 Broken Access Control |
| Client-side route guards (bypassable) | CWE-602 | A06:2025 Insecure Design |
| Application state inspectable via DevTools | CWE-200 | A01:2025 Broken Access Control |
| All business logic runs in user-controlled environment | CWE-602 | A06:2025 Insecure Design |

## Consequences

- **Positive:** Maximum attack surface for pentesting — tokens, API calls, state, and logic all browser-accessible.
- **Positive:** Simpler mental model during the build phase — no server/client boundary to reason about.
- **Positive:** The transition from CSR to partial SSR in v2.x will be a concrete, demonstrable hardening step.
- **Positive:** Teaches the real-world lesson: "anything on the client is attacker-controlled".
- **Negative:** Any XSS gives the attacker visibility into everything the application does.
- **Negative:** Client-side auth guards provide zero real protection (frontend hides UI, backend must enforce).
- **Negative:** Doesn't exercise RSC during v0.x/v1.x. RSC patterns will be learned during v2.x hardening.

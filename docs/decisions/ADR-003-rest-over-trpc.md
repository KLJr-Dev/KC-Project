# ADR-003: REST over tRPC for API Communication

**Status:** Accepted

**Date:** v0.0.5 (Backend Reachability Test)

---

## Context

The frontend needs to communicate with the backend. The main options:

- **REST (JSON over HTTP)** — Industry standard. HTTP methods map to CRUD. Widely understood, toolable (curl, Postman, Swagger), language-agnostic.
- **tRPC** — End-to-end type safety between TypeScript client and server. No API schema needed. Types flow automatically.
- **GraphQL** — Schema-first, client specifies exactly what data it needs. Powerful but complex for CRUD-heavy apps.

## Decision

Use **REST** with typed fetch wrappers and OpenAPI code generation for type safety.

REST was chosen because:

1. **Security testing realism** — Real-world penetration testing targets REST APIs. Tools like Burp Suite, curl, and OWASP ZAP work natively with HTTP/REST. tRPC's binary-ish protocol is harder to inspect and attack.
2. **Decoupled client/server** — REST enforces a clear boundary. The frontend and backend can drift (intentionally, for security scenarios like shape mismatches).
3. **Transferable skills** — REST is the dominant API pattern in industry. Understanding it deeply (status codes, headers, CORS, content types) is more broadly applicable.
4. **Tooling** — Swagger/OpenAPI provides documentation, client generation, and a testing UI for free.

## Consequences

- **Positive:** Every route is inspectable via curl/browser. Ideal for security learning.
- **Positive:** OpenAPI codegen (v0.0.8) closes most of the type-safety gap vs tRPC.
- **Positive:** API can be consumed by any HTTP client, not just the TypeScript frontend.
- **Negative:** Manual DTO mirroring was needed initially (v0.0.7). Solved by codegen in v0.0.8.
- **Negative:** No automatic end-to-end type inference like tRPC provides. Type drift is possible if codegen is not run after backend changes.

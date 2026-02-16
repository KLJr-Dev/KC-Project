# ADR-006: Intentionally Insecure Design Philosophy

**Status:** Accepted

**Date:** v0.0.2 (Roadmap & Scope Definition)

---

## Context

KC-Project exists to learn web security through building, breaking, and fixing. The standard approach to teaching security is to study vulnerabilities in isolation (CTF challenges, OWASP examples). An alternative is to **build a realistic system that contains real vulnerabilities**, then systematically discover and fix them.

## Decision

KC-Project follows an **insecure-by-design → penetration testing → hardening** lifecycle.

Core principles:

1. **Build vulnerable first.** v0.x and v1.0 intentionally contain security weaknesses: plaintext passwords, missing auth checks, sequential IDs, IDOR, verbose error messages, trusted client input, etc.
2. **Document the weaknesses.** Every vulnerability is introduced knowingly and will be documented as part of the v1.0 baseline.
3. **Break it formally.** Structured penetration testing against each insecure version, using real tools and methodologies.
4. **Fix it incrementally.** v2.x applies remediation and hardening, producing secure counterparts to each insecure version.
5. **Learn from the delta.** The difference between v1.x (insecure) and v2.x (hardened) is the actual security education.

This is **not** negligence — it is controlled failure as a learning methodology.

## Consequences

- **Positive:** Security decisions are experienced firsthand, not just studied theoretically.
- **Positive:** The codebase serves as a realistic target for penetration testing practice.
- **Positive:** The progression from insecure to secure is documented and traceable across versions.
- **Positive:** Every security control in v2.x has a corresponding absence in v1.x, making the "why" visceral.
- **Negative:** The codebase must never be deployed to production or exposed to real users before v2.x hardening.
- **Negative:** Contributors must understand the philosophy to avoid "fixing" intentional weaknesses prematurely.
- **Negative:** Code reviews cannot follow standard security checklists — the checklist is inverted during v0.x/v1.x.

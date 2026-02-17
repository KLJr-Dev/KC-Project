# ADR-013: Perpetual Expansion Cycle Versioning

**Status:** Accepted

**Date:** v0.1.x (Identity Surface)

---

## Context

The original roadmap (v0.0.2) defined a linear progression: v0.x builds the insecure application, v1.0.0 freezes it, and v2.x hardens it. This creates a single insecure/secure pair and then the project is "done".

But the project's value as a learning sandbox and portfolio piece depends on being **expandable**. New vulnerability classes (XSS, CSRF, SSRF, deserialization, race conditions) should be addable without rearchitecting the versioning model. The project should never reach a terminal state.

## Decision

Adopt a **perpetual insecure/secure expansion cycle**:

```
v1.0.0 (insecure MVP, ~15 CWEs)
  → v1.0.x (pentest + patch)
  → v2.0.0 (secure parallel to v1.0.0)
  → v1.1.0 (fork v2.0.0, add ~10 new CWEs)
  → v1.1.x (pentest + patch)
  → v2.1.0 (secure parallel to v1.1.0)
  → v1.2.0 (fork v2.1.0, add ~10 new CWEs)
  → ...repeat indefinitely
```

### Version semantics

| Pattern | Meaning |
|---------|---------|
| **v0.N.x** | Build phase — incrementally constructing the application |
| **v1.N.0** | Insecure baseline — Nth wave of intentional vulnerabilities |
| **v1.N.x** | Pentest cycle — structured testing, discovery, incremental patches |
| **v2.N.0** | Secure parallel — all v1.N.0 CWEs remediated |
| **v1.N+1.0** | Next insecure baseline — fork from v2.N.0, add new vulnerability surface |

### Cycle mechanics

1. **Build** (v1.N.0) — Fork from the previous secure version (v2.(N-1).0, or v0.6.4 for the first cycle). Introduce 5-15 new CWEs across new or existing attack surfaces.
2. **Test** (v1.N.x) — Structured penetration testing using real tools and methodologies. Each patch version documents a finding and applies a fix.
3. **Harden** (v2.N.0) — All weaknesses from v1.N.0 are remediated. The system is functionally identical but secure.
4. **Expand** (v1.N+1.0) — Fork the secure version. Break it again with new vulnerability classes. Repeat.

### Growth projection

| Cycle | Insecure | Secure | New CWEs | Cumulative | Example new surfaces |
|-------|----------|--------|----------|-----------|---------------------|
| 1 | v1.0.0 | v2.0.0 | ~15 | ~15 | Identity, Data, Injection, Files, AuthZ, Infra |
| 2 | v1.1.0 | v2.1.0 | ~10 | ~25 | XSS, CSRF, SSRF, Deserialization |
| 3 | v1.2.0 | v2.2.0 | ~10 | ~35 | Race conditions, Cache poisoning, JWT algorithm confusion |
| 4 | v1.3.0 | v2.3.0 | ~10 | ~45 | Supply chain, CI/CD, cloud misconfigurations |
| N | v1.N.0 | v2.N.0 | ~5-10 | Growing | Whatever is relevant at the time |

## Why Not the Linear Model

The original linear model (v1.0.0 insecure → v2.0.0 secure → done) has problems:

1. **Terminal state** — After v2.0.0, there's nothing left to do. The project becomes a static archive.
2. **Limited scope** — 15 CWEs covers the basics but misses entire vulnerability classes (client-side attacks, concurrency, supply chain).
3. **No portfolio growth** — A one-shot project demonstrates one pentest cycle. The expansion model demonstrates the ability to iterate, which is more valuable.
4. **Unrealistic** — Real applications don't get "done" with security. New features introduce new surfaces. The cycle model reflects this.

## Consequences

- **Positive:** The project never reaches a terminal state. Always expandable.
- **Positive:** Each cycle is a self-contained portfolio piece (insecure → pentest → secure).
- **Positive:** Cumulative CWE coverage grows to cover the full OWASP landscape over time.
- **Positive:** Forces realistic security thinking — "what new attacks does this feature introduce?"
- **Positive:** The fork-from-secure pattern ensures each cycle starts from a clean, hardened baseline.
- **Negative:** Versioning is more complex than a simple linear model. Requires discipline to track which CWEs belong to which cycle.
- **Negative:** Later cycles may require significant new features (e.g. adding WebSocket support to introduce new attack classes). The expansion is not free.
- **Negative:** The v1.N+1.0 growth projections are speculative. Actual CWE counts will depend on what's realistic for the application's stack at the time.

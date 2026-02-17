# Project Specification

Formal specification documents for KC-Project. These define what the system is, what it must do, who uses it, and what "secure" looks like.

Unlike the [roadmap](../roadmap/) (which defines the build order) and [architecture](../architecture/) (which describes how the system is structured), the spec documents answer **what** and **why** at a project level.

---

## Contents

### [scope.md](scope.md)

System type, core functionality, design characteristics, security context, lifecycle orientation, and explicit in-scope / out-of-scope boundaries.

### [requirements.md](requirements.md)

Functional, non-functional, and security requirements grouped by domain and tagged with the roadmap version they are introduced.

### [personas.md](personas.md)

Primary stakeholders (developer, pentester, security engineer) and in-app user personas (regular user, admin, visitor, attacker).

### [security-baseline.md](security-baseline.md)

Target security controls for v2.0.0 (the hardened counterpart). The "done" checklist that v1.N.x pentesting works toward. Each control references the CWE it remediates.

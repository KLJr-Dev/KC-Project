# KC-Project — Portfolio Vision

**Purpose:** Frame why this repo exists as a CV/portfolio piece, how to grow it without turning it into an endless toy app, and what “done” means at each milestone.

**Related (technical authority):** [STRATEGY.md](./STRATEGY.md) · [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md) · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) · [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md) · [ADR-026](../decisions/ADR-026-versioning-expansion-cycle.md) · [ADR-031](../decisions/ADR-031-security-cycle-docs.md)

---

## 1. Primary success criterion: explainability

The main portfolio signal is not line count or CWE count — it is **being able to explain the code, the architecture, and the full SDLC process** in an interview or walkthrough.

| Principle | Practice |
|-----------|----------|
| **Own the stack** | Time in the repo (reading, pentesting, remediating) builds familiarity with NestJS, Next.js, TypeORM, Docker, nginx, and the security model — regardless of who wrote the initial diff. |
| **Trace any claim** | Every vulnerability, fix, and design choice should trace to: code → ADR or ground truth → pentest evidence → remediation mapping. |
| **Teach back** | If you cannot whiteboard auth flow, RBAC guards, file storage, or a specific exploit chain from memory, that area needs more hands-on time before the next release tag. |

**Interview prep checklist (not a release blocker):**

- [ ] Walk through request lifecycle: browser → nginx → NestJS guard → service → TypeORM → disk
- [ ] Explain each demo-user role and at least one privilege-escalation path end-to-end
- [ ] Demonstrate one file-handling vuln and one auth vuln live against tag `v1.0.0` or `ctf/v1.1.0`
- [ ] Summarise why v2.x fixes differ from insecure/CTF baselines without reading slides

---

## 2. Three documentation tracks (employer + self)

Documentation is a first-class deliverable, not an afterthought. Three parallel audiences, one repo.

### A. Software engineering (DevSecOps / full-stack)

**Audience:** Hiring managers, senior engineers, future you revisiting the codebase.

| Artifact type | Location | Purpose |
|---------------|----------|---------|
| Architecture | [docs/architecture/](../architecture/) | System design, data model, STRIDE |
| ADRs | [docs/decisions/](../decisions/) | Why NestJS, JWT, Docker, expansion cycles, etc. |
| Folder READMEs | `backend/`, `frontend/`, `infra/`, module `dto/` folders | Local context without opening every file |
| Inline comments | Non-obvious business/security logic only | Intentional vulns, guard gaps, seed assumptions |
| Spec & baseline | [docs/spec/](../spec/), [security-baseline.md](../spec/security-baseline.md) | Requirements and v2.N.0 control checklist |
| Release notes | [docs/release/](../release/) | What shipped, how to run, verification gates |

**Portfolio angle:** Demonstrates professional SDLC habits — decisions are recorded, scope is bounded, releases are verifiable (`smoke-test.sh`, `journey-test.sh`, `e2e-docker.sh`).

### B. Offensive security (pentest / OSCP-style)

**Audience:** Security roles, CTF reviewers, portfolio readers who want exploit narrative.

| Artifact type | Location | Purpose |
|---------------|----------|---------|
| Cycle workspace | [docs/security/Cycle-N/](../security/Cycle-1/README.md) | Version map, checklist, team folders |
| Ground truth | `Cycle-N/Dev/v1.N.0-ground-truth.md` | Repro steps, endpoint matrix, developer cheat sheet |
| Pentest writeup | `Cycle-N/PenTest/v1.N.0-writeup.md` | **Portfolio piece** — methodology, findings, PoC, impact, evidence |
| Screenshots / notes | `Cycle-N/PenTest/screenshots/` | Burp, curl, privilege chains |
| CWE inventory | [cwe-inventory.md](../security/cwe-inventory.md) | Cross-cycle instance registry |

**Style target:** Real pentest reports and OSCP-style writeups — scope, recon, enumeration, exploitation, post-exploitation (where applicable), findings table, risk rating, recommendations. Research public writeups and HTB/OSCP lab reports for tone and structure; do not invent fantasy findings.

**Cycle-1 writeup:** [PenTest/v1.0.0-writeup.md](../security/Cycle-1/PenTest/v1.0.0-writeup.md) (complete). Cycle-2 writeup lives on `ctf/v1.1.0`.

### C. Defensive security (Blue Team / remediation)

**Audience:** AppSec, SOC-adjacent roles, “both sides of the house” narrative.

| Artifact type | Location | Purpose |
|---------------|----------|---------|
| Remediation writeup | `Cycle-N/Remediation/v2.N.0-remediation.md` | Finding → root cause → fix → verification |
| Security baseline | [security-baseline.md](../spec/security-baseline.md) | Control checklist for secure release |
| Threat model | [docs/diagrams/threat-model.md](../diagrams/threat-model.md) | STRIDE-aligned view after hardening |
| Detection ideas (future) | `Cycle-N/BlueTeam/` (optional per cycle) | Log sources, SIEM rules, hardening deltas |

**Portfolio angle:** Shows you can fix what you break — paired insecure/secure releases with explicit control mapping, not hand-wavy “we added bcrypt.”

---

## 3. Modular expansion model (not an infinite webapp)

The repo is a **framework for repeated cycles**, not a single app that grows forever without boundaries.

### Version semantics (recap)

```
v1.N.0  ── insecure baseline (new or inherited vulns)
v1.N.x  ── pentest + critical patches only
v2.N.0  ── secure parallel (all Cycle-N app vulns remediated)
v1.N+1.0 ── fork from v2.N.0, add new vulnerability class (+ optional features)
```

Each **Cycle N** is a bounded portfolio unit:

| Phase | Versions | Deliverable |
|-------|----------|-------------|
| Build | v1.N.0 | Tagged release, ground truth doc, deploy path verified |
| Attack | v1.N.x | Completed pentest writeup, CWE evidence, optional v1.N.1 patches |
| Defend | v2.N.0 | Remediation writeup, security baseline satisfied, e2e green |
| Expand | v1.N+1.0 | New cycle begins — only after v2.N.0 is tagged |

**Git tags and GitHub Releases** mark cycle boundaries. A cycle is “done” when:

1. Insecure release tagged (`v1.N.0`)
2. Pentest writeup complete with PoC evidence
3. Secure release tagged (`v2.N.0`)
4. Remediation writeup maps every finding to a fix or accepted risk
5. Release notes + verification scripts pass on clean VM/compose

That is a **shippable portfolio chapter**, not WIP forever.

### What can change between cycles (modularity)

Within the same monorepo framework:

- New **domains** (e.g. notifications, billing, API gateway)
- New **microservices** (extract file service, add worker queue) — later cycles
- New **integrations** (OAuth provider, S3 storage, Redis cache)
- New **deployment targets** (see §4)
- New **CWE classes** (~10–15 per major expansion, per STRATEGY Part 4)

What stays stable:

- Cycle folder layout (ADR-031)
- v1 insecure / v2 secure pairing
- ADR + release note discipline
- Verification gate scripts under `infra/`

---

## 4. Deployment evolution (future, not Cycle-1)

Cycle-1 scope: **Docker Compose + optional Ubuntu VM** ([infra/README.md](../../infra/README.md)).

Later cycles can fork deployment without forking the whole product story:

| Variant | Example tag | Purpose |
|---------|-------------|---------|
| Local / VM Docker | v1.0.0, v2.0.0 | Baseline — personal lab, OSCP-style box |
| AWS (or other cloud) | v1.3.0-aws, v2.3.0-aws | Misconfigurations: IAM, S3, exposed SGs, secrets in env |
| K8s (optional) | v1.4.0-k8s | RBAC, network policies, image pull secrets |

Cloud variants are **additional release lines**, not replacements — tags make it clear which deploy story an employer is looking at.

---

## 5. Cycle roadmap (high level)

### Cycle-1 — **CLOSED** (v1.0.0 → v2.0.0)

| Item | Status |
|------|--------|
| v1.0.0 insecure MVP | Done · tag `v1.0.0` |
| Ground truth | [Complete](../security/Cycle-1/Dev/v1.0.0-ground-truth.md) |
| Pentest writeup | [Complete](../security/Cycle-1/PenTest/v1.0.0-writeup.md) |
| v2.0.0 remediation | Done · merged `main` · frozen `remediation/v2.0.0` |
| Git tag `v1.0.0` / `v2.0.0` | Done |

### Cycle-2 — **CLOSED** (v1.1.0 CTF → v2.1.0)

| Item | Status |
|------|--------|
| CTF box | Done · `ctf/v1.1.0` / tag `v1.1.0` |
| Blue remediation | Done · tag `v2.1.0` on `main` · frozen `remediation/v2.1.0` |
| Secure-ready gate | [Signed](../release/v2.1.0-secure-ready.md) |

**Focus:** SoftDev surface expansion (version bump) and/or next CTF on **v2.1.0** without a product version bump ([ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md); [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md)).

### Cycle-3 — closed (`ctf/leak-crack-db`)

Share-plant → SQLi search → crack → published PG. Blue = docs + regression on `main` (no version bump).

### Cycle-4 — SoftDev on `main` (`v1.2.0` → `v2.2.0`)

Notes + SSH **foothold** shipped to `main` (PR #21); tag **`v1.2.0`** pending examiner sign-off. Not PrivEsc ([box plan](../security/Cycle-4/Dev/v1.2.0-box-plan.md) · [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md)).

### Cycle-5 — shells & PrivEsc (sketch, soon after `v2.2.0`)

Same SSH lineage; reverse shells + PrivEsc → `root.txt` ([sketch](../security/Cycle-5/Dev/shells-privesc-sketch.md)). Prefer SoftDev pair `v1.3.0`→`v2.3.0` or CTF overlay after Blue.

### Cycle-6+ — combinations

Further SoftDev/CTF modules (SSRF, cloud, FTP overlays, etc.) on the current tip.

---

## 6. Anti-patterns (what this project is not)

| Avoid | Instead |
|-------|---------|
| Endless feature sprawl without tags | Ship SoftDev surface bumps as tagged releases |
| Docs that lag code by months | Update cycle docs in the same phase |
| CWE inflation without exploitation | Every instance needs repro evidence in pentest phase |
| Skipping Blue after Red | Freeze CTF + remediation branches; land fixes on `main` |
| Replacing mastery with generated code | Re-read and run every major flow yourself before interviews |
| Inventing product versions for every CTF | [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) |

---

## 7. Employer-facing one-liner

> KC-Project is a full-stack web app with a documented insecure → pentest → remediate lifecycle. Cycles 1–2 shipped tagged insecure/CTF and secure pairs; from v2.1.0 onward, SoftDev bumps versions on surface expansion while CTFs misconfigure the current app without fake version inflation.

---

## 8. Immediate next actions

1. Tag **`v1.2.0`** after examiner dry-run + sign [pentest-ready](../release/v1.2.0-pentest-ready.md); archive `ctf/v1.2.0`.
2. Red writeup (F1–F3) → `remediation/v2.2.0` → tag `v2.2.0`.
3. Cycle-5: shells + PrivEsc ([sketch](../security/Cycle-5/Dev/shells-privesc-sketch.md)).

---

*Last updated: August 2026 — Cycles 1–3 closed; Cycle-4 SoftDev on `main`; Cycle-5 sketched.*

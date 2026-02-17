# ADR-014: GitHub as VCS Platform

**Status:** Accepted

**Date:** v0.0.1 (Repository Skeleton)

---

## Context

The project needs a hosted version control platform for source code, pull requests, issue tracking, and eventually CI/CD pipelines.

Options considered:

- **GitHub** — Dominant platform. Free private repos, Actions for CI/CD, integrated PR reviews, wide ecosystem (Dependabot, CodeQL, Pages). Cloud-hosted.
- **GitLab (cloud)** — Similar feature set. Built-in CI/CD (arguably more mature than Actions). Free tier includes container registry.
- **GitLab (self-hosted)** — Same as above but deployed on own infrastructure. Full control. Adds operational complexity.
- **Gitea / Forgejo** — Lightweight self-hosted. Minimal features compared to GitHub/GitLab.

## Decision

Use **GitHub** as the primary VCS platform for all development from v0.0.1 through v0.6.x.

When the VM and Docker infrastructure is set up (v0.5.x+), introduce **self-hosted GitLab as a parallel** platform:

### Phase 1: GitHub only (v0.0.x through v0.4.x)

- All source code, PRs, and issues live on GitHub
- No CI/CD pipelines yet (per ADR-017)
- GitHub is the single source of truth

### Phase 2: GitHub + GitLab parallel (v0.5.x+)

- Self-hosted GitLab deployed on the Ubuntu VM alongside the application
- Repository mirrored from GitHub to GitLab (or maintained in parallel)
- GitLab CI/CD pipelines handle Docker builds and deployment
- GitHub remains the primary collaboration platform
- GitLab adds realism: self-hosted Git, integrated container registry, CI runners on the same VM

### Why this phased approach

1. **GitHub first** — no infrastructure to manage during the build phase. Focus stays on code.
2. **GitLab later** — self-hosting GitLab is part of the infrastructure surface (v0.5.x+). It adds operational realism and a new attack surface (GitLab itself can be misconfigured, tokens can leak, CI pipelines can be exploited).
3. **Parallel, not replacement** — GitHub stays for collaboration (PRs, issues, visibility). GitLab handles deployment-side concerns.

## Consequences

- **Positive:** Zero ops overhead during the build phase. GitHub Just Works.
- **Positive:** Self-hosted GitLab in Phase 2 adds infrastructure realism and a new attack surface for pentesting.
- **Positive:** GitLab's built-in container registry simplifies Docker image management once containers exist.
- **Positive:** The dual-platform setup mirrors real-world organisations that use GitHub for open-source visibility and GitLab for internal CI/CD.
- **Negative:** Maintaining two platforms adds operational complexity in Phase 2.
- **Negative:** Mirror sync between GitHub and GitLab requires configuration and can drift.

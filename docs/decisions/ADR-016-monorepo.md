# ADR-016: Monorepo Structure

**Status:** Accepted

**Date:** v0.0.1 (Repository Skeleton)

---

## Context

The project consists of a frontend (Next.js), a backend (NestJS), documentation, and infrastructure config. These can live in one repository or be split across multiple.

Options considered:

- **Monorepo (single repo)** — All projects in one repository under separate directories (`backend/`, `frontend/`, `docs/`, `infra/`).
- **Polyrepo (separate repos)** — One repo per project (`kc-backend`, `kc-frontend`, `kc-docs`, `kc-infra`).
- **Monorepo with tooling (Nx / Turborepo)** — Monorepo with a build orchestration layer for dependency management, caching, and task running.

## Decision

Use a **simple monorepo** with top-level directories. No monorepo tooling.

```
KC-PROJECT/
├── backend/        NestJS REST API
├── frontend/       Next.js App Router
├── docs/           All documentation
├── infra/          Deployment and infrastructure config (future)
└── README.md       Project overview
```

Each directory has its own `package.json`, `tsconfig.json`, and tooling config. They are independent Node.js projects that happen to share a repository.

### Why monorepo over polyrepo

1. **Atomic commits** — A change that affects both frontend and backend (e.g. adding a new DTO) is a single commit, not a coordinated multi-repo release.
2. **Shared tooling** — Root-level Prettier config (`.prettierrc`) is shared by both projects. One place to change formatting rules.
3. **Documentation co-location** — Architecture docs, ADRs, and diagrams live next to the code they describe. No separate docs repo to keep in sync.
4. **Simpler onboarding** — Clone one repo, see everything. No need to coordinate multiple repositories.
5. **Version traceability** — Git tags and branches apply to the entire project state (frontend + backend + docs at a point in time), not just one component.

### Why no monorepo tooling (Nx / Turborepo)

- The two projects (`backend/`, `frontend/`) are independently built and run. There are no shared libraries or build dependencies between them.
- Monorepo tools add configuration complexity (workspace definitions, task pipelines, caching) that doesn't provide value when the projects don't share code.
- If shared packages are ever needed (e.g. a `packages/types` directory), tooling can be added then.

### Why not polyrepo

- Coordinating changes across repos adds friction. A backend DTO change would require a separate frontend commit to update types, with no atomic guarantee they're in sync.
- Documentation would need its own repo or be split across repos, making cross-referencing harder.
- Version tags would apply per-repo, losing the "snapshot of the full system" semantics.

## Consequences

- **Positive:** Single clone, single git history, atomic changes across the full stack.
- **Positive:** Shared Prettier config at root. Consistent formatting without per-project duplication.
- **Positive:** Docs, infra, and code are always in sync at any given commit.
- **Negative:** Git history contains both frontend and backend changes. Noisier for someone working on only one.
- **Negative:** No build caching or incremental compilation across projects. Each project rebuilds independently.
- **Negative:** If the repo grows very large, clone times increase. Not a concern at this scale.

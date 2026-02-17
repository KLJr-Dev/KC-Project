# ADR-015: Branching Strategy

**Status:** Accepted

**Date:** v0.0.1 (Repository Skeleton)

---

## Context

The project has two independent workstreams (frontend and backend) developed in the same repository. A branching strategy is needed to manage parallel development, integration, and stable releases.

Options considered:

- **Trunk-based development** — Everyone commits to `main`. Feature flags or short-lived branches. Fast, but risky without CI/CD and tests.
- **GitFlow** — `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`. Well-structured but heavy for a small team.
- **Simplified branch model** — `main` + `dev` + long-lived feature branches. Less ceremony than GitFlow, more structure than trunk-based.

## Decision

Use a **simplified four-branch model**:

```
main            Stable releases only (squash-merged from dev)
 └── dev        Integration branch — features merge here first
      ├── frontend    Frontend feature work (long-lived)
      └── backend     Backend feature work (long-lived)
```

### Rules

1. **`main`** receives commits only from `dev` via squash-merge PRs. Every merge to `main` represents a stable, tested version.
2. **`dev`** is the integration branch. Frontend and backend changes merge here. Integration testing happens on `dev` before anything goes to `main`.
3. **`frontend`** and **`backend`** are long-lived feature branches off `dev`. Day-to-day work happens here.
4. **Hotfix branches** can be created from `main` for critical fixes, then merged back to both `main` and `dev`.
5. **Squash-merge** is the default merge strategy into `main` — keeps the main branch history clean with one commit per version/feature.

### Why not trunk-based

- No CI/CD yet (ADR-017). Without automated tests on every push, committing directly to `main` is risky.
- Two independent workstreams (FE/BE) need isolation during development. A frontend change shouldn't block backend work.

### Why not GitFlow

- Overkill for this project. No need for `release/*` branches when versions are tagged manually. No need for `hotfix/*` branches when the project isn't deployed to production yet.
- The complexity of GitFlow doesn't pay for itself until there are multiple concurrent releases.

### Why long-lived feature branches

- Frontend and backend evolve on different timelines. A frontend UI change might take days while backend auth work takes hours.
- Long-lived branches avoid the overhead of creating/merging dozens of short-lived `feature/xxx` branches during rapid iteration.
- The trade-off is potential merge conflicts, mitigated by frequent merges to `dev`.

## Consequences

- **Positive:** Clear separation between stable (`main`), integrated (`dev`), and in-progress (`frontend`/`backend`).
- **Positive:** Squash-merge to `main` keeps release history clean and readable.
- **Positive:** Simple enough to follow without tooling or automation.
- **Negative:** Long-lived branches can diverge. Requires discipline to merge to `dev` frequently.
- **Negative:** No automated enforcement (no branch protection rules yet). Relies on convention.

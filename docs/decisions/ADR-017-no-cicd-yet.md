# ADR-017: No CI/CD Yet (Deferred)

**Status:** Accepted

**Date:** v0.0.8 (Development Tooling Baseline)

---

## Context

CI/CD pipelines (automated linting, testing, building, and deployment on every push/PR) are standard practice. The question is whether to set them up now or defer.

At v0.0.8, the project has:

- ESLint and Prettier configured on both projects
- TypeScript strict mode
- Jest for unit tests, Supertest for e2e tests
- No deployment target (everything runs locally)
- No Docker containers
- No staging or production environment

## Decision

**Defer CI/CD entirely** until the deployment surface is introduced (v0.5.x).

### Current state (v0.0.x through v0.4.x)

- Tests run manually: `npm test` (unit), `npm run test:e2e` (e2e)
- Linting run manually: `npm run lint`, `npm run format:check`
- No automated checks on push or PR
- No deployment pipeline — there's nowhere to deploy to

### Planned state (v0.5.x+)

When Docker and VM deployment are introduced, CI/CD will be added:

- **GitHub Actions** for automated lint, test, and build on PR
- **Docker image builds** triggered on merge to `dev`
- **Deployment to VM** via SSH or GitLab CI runner
- **GitLab CI** (per ADR-014) for deployment-side pipelines once self-hosted GitLab is set up

### Why defer

1. **No deployment target** — CI/CD pipelines that lint and test but don't deploy are of limited value. The feedback loop for manual `npm test` is fast enough during local development.
2. **Premature abstraction** — Setting up Actions workflows now would need reworking when Docker, environment variables, and deployment targets are introduced. Better to build the pipeline alongside the infrastructure it serves.
3. **Focus** — v0.0.x through v0.1.x are about code shape and behaviour. Tooling overhead should be minimised.

### What we lose by deferring

- No automated test gate on PRs. A broken test can be merged if not caught manually.
- No lint enforcement on CI. Formatting drift is possible if someone forgets to run Prettier.
- No build verification. TypeScript compilation errors could be merged.

These risks are acceptable at this scale and team size. The manual workflow is sufficient.

## Consequences

- **Positive:** Zero pipeline maintenance during the build phase. No YAML to debug.
- **Positive:** CI/CD introduction in v0.5.x can be designed holistically with Docker, environment config, and deployment in mind.
- **Positive:** Avoids premature pipeline design that would need reworking.
- **Negative:** No automated test gate. Broken code can reach `dev` or `main` without being caught.
- **Negative:** No forced lint/format check. Relies on developer discipline.
- **Negative:** The project appears less "professional" without CI badges. Acceptable for the current phase.

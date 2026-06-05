# ADR-028: v0.9 Product UX (API Explorer → App UI)

**Status:** Accepted

**Date:** v0.9.0

---

## Context

Through v0.8 the frontend was a contract-verification UI (`POST /files`, raw JSON). v1.0.0 requires a realistic, role-aware web app for pentesting while preserving API surface for tooling.

## Decision

1. Move API explorers to `/dev/*` (pentester path).
2. Default nav uses product UI: My Files, Sharing, Review (mod/admin), Admin.
3. Standardize errors via `ErrorBanner`, `formatUserError`, empty/loading states.
4. No new backend routes; UX changes are frontend-only.

## Consequences

- Pentesters retain raw explorers at `/dev`.
- Regular users get human labels and role-gated flows.
- Moderator approve workflow exposed in UI for the first time.

# ADR-005: TypeScript Strict Mode on Both Projects

**Status:** Accepted

**Date:** v0.0.8 (Development Tooling Baseline)

---

## Context

TypeScript's `strict` flag enables a bundle of checks: `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`, `strictPropertyInitialization`, `strictFunctionTypes`, `noImplicitThis`, `alwaysStrict`, and `useUnknownInCatchVariables`.

The frontend (Next.js scaffold) came with `strict: true` by default. The backend (NestJS scaffold) came with only `strictNullChecks: true` and `noImplicitAny: false`.

The question: should we align both to `strict: true`, or keep the backend relaxed?

## Decision

Enable **`strict: true`** on both `tsconfig.json` files.

Rationale: the project is intentionally insecure at the **application layer** (weak auth, missing validation, IDOR). But the **tooling layer** should be sound. Strict TypeScript catches real bugs (null derefs, implicit any, unchecked property access) that would waste debugging time without contributing to the security learning goals.

## Consequences

- **Positive:** Consistent strictness across both projects. No surprises when moving between frontend and backend code.
- **Positive:** `strictPropertyInitialization` forced us to use `!:` (definite assignment) on response DTO required fields — this is the correct NestJS pattern for DTOs not initialized via constructor.
- **Positive:** `noImplicitAny` catches missing type annotations that could hide bugs.
- **Negative:** 5 response DTO files needed `!:` fixes when strict was enabled. Minor one-time cost.
- **Negative:** Future code must satisfy stricter checks, which adds friction when writing quick stubs. Acceptable tradeoff.

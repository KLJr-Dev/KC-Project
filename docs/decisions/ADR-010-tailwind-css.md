# ADR-010: Tailwind CSS as Design System

**Status:** Accepted

**Date:** v0.0.4 (Frontend Bootstrapping)

---

## Context

KC-Project needs a styling approach for the frontend. The UI doesn't need to be a design showcase, but it should look professional enough to feel like a real application (important for realistic pentesting and portfolio presentation).

Options considered:

- **Tailwind CSS** — Utility-first CSS framework. Classes applied directly in JSX. No separate stylesheets. Highly customisable via config.
- **CSS Modules** — Scoped CSS files per component. Standard React pattern. No runtime cost.
- **styled-components / Emotion** — CSS-in-JS. Co-locates styles with components. Runtime overhead.
- **Plain CSS / globals only** — Minimal setup. No tooling. Hard to maintain at scale.

## Decision

Use **Tailwind CSS 4** with CSS custom properties (design tokens) defined in `globals.css`.

Rationale:

1. **Speed** — Utility classes are faster to write than separate CSS files. For a project where UI is not the primary focus, this matters.
2. **Design tokens** — CSS variables (`--color-background`, `--color-primary`, etc.) in `globals.css` drive the entire colour system. Tailwind's `@theme` directive maps them to utility classes. This gives us dark mode via a single `.dark` class toggle.
3. **No component library dependency** — All UI components (FormInput, SubmitButton, ErrorBanner) are hand-built with Tailwind classes. No dependency on shadcn, MUI, or similar. Keeps the bundle small and the code transparent.
4. **Industry relevance** — Tailwind is widely adopted. Patterns learned here transfer.

## Consequences

- **Positive:** Consistent look with minimal effort. Dark/light mode works via CSS variables + `.dark` class.
- **Positive:** No separate stylesheet files to manage. Styles are co-located with markup.
- **Positive:** Tailwind's purge removes unused classes — small production CSS bundle.
- **Negative:** Long class strings in JSX can be hard to read. Mitigated by extracting reusable components.
- **Negative:** Tailwind is a build-time dependency. Adds to the frontend's toolchain.
- **Negative:** Not using a component library means more manual work for complex UI (tables, modals, etc.). Acceptable — UI complexity is low for this project.

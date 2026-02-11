# Frontend App Directory (`app/`)

This directory uses the **Next.js App Router** convention. Each subdirectory
maps to a URL route; `page.tsx` files define the page component rendered at
that route.

---

## Current Status (v0.0.7)

All pages are `'use client'` components that call the backend API via
`lib/api.ts` and display raw JSON responses. This is a **contract
verification UI**, not production design.

---

## Route Map

```
/                         Dashboard — backend status, section links
/users                    List all users + create form          (GET /users, POST /users)
/users/[id]               View, update, delete single user      (GET/PUT/DELETE /users/:id)
/auth                     Register + login forms side by side   (POST /auth/register, POST /auth/login)
/files                    Upload form + lookup by ID            (POST /files, GET /files/:id)
/files/[id]               View metadata + delete                (GET/DELETE /files/:id)
/admin                    List all admin items + create form    (GET /admin, POST /admin)
/admin/[id]               View, update, delete admin item       (GET/PUT/DELETE /admin/:id)
/sharing                  List all shares + create form         (GET /sharing, POST /sharing)
/sharing/[id]             View, update, delete share            (GET/PUT/DELETE /sharing/:id)
```

---

## File Structure

```
app/
├── layout.tsx            # Root layout — nav bar linking to each section
├── page.tsx              # Dashboard (backend ping + section cards)
├── globals.css           # Tailwind CSS base + theme variables
├── favicon.ico
├── users/
│   ├── page.tsx          # List + create
│   └── [id]/
│       └── page.tsx      # Detail + update + delete
├── auth/
│   └── page.tsx          # Register + login
├── files/
│   ├── page.tsx          # Upload + lookup
│   └── [id]/
│       └── page.tsx      # Detail + delete
├── admin/
│   ├── page.tsx          # List + create
│   └── [id]/
│       └── page.tsx      # Detail + update + delete
└── sharing/
    ├── page.tsx          # List + create
    └── [id]/
        └── page.tsx      # Detail + update + delete
```

---

## UI Approach

- Developer/contract verification UI — forms, tables, raw JSON responses
- Errors displayed inline in red blocks; success in green blocks
- Minimal Tailwind styling — readable but not polished
- No loading skeletons, toasts, or production UX patterns
- No route guards or protected pages

---

## Conventions

- All pages use `'use client'` (client components with React state)
- API calls happen in `useEffect` (on mount) or form submit handlers
- Errors are caught and displayed, never swallowed
- Backend route exercised is shown as a heading above each form/section
  (e.g. "POST /users", "DELETE /files/:id")

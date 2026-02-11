# Frontend

This directory contains the frontend application for **KC-Project**.

The frontend is implemented using **Next.js (App Router)** and provides
the user-facing interface for interacting with the backend API. Like
the backend, it is developed incrementally and intentionally lacks
strong security guarantees in early versions.

---

## Current Status

**Version:** v0.0.7 (Foundation Phase)

- Next.js application scaffolded (App Router, Tailwind CSS)
- Client-side types mirror all backend DTOs (`lib/types.ts`)
- Typed API client covers every backend route (`lib/api.ts`)
- Pages exercise full CRUD for all five backend domains
- Backend connectivity verified via `/ping`
- No authentication enforcement
- No form validation
- No token storage or session handling
- DTO types are manually mirrored (codegen planned for v0.0.8)

---

## Purpose

The frontend is considered an **untrusted client** at all stages of
the project. All security enforcement is expected to occur server-side.

The frontend will eventually be responsible for:
- User authentication flows
- Role-based UI rendering
- File management interactions
- Administrative interfaces
- Client-side navigation and state handling

---

## Running the Frontend (Local Development)

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on `http://localhost:3000` by default.
The backend must be running on `http://localhost:4000` for API calls to succeed.

---

## Directory Structure

```
frontend/
├── app/                  # Next.js App Router pages and layout
│   ├── layout.tsx        # Root layout with navigation bar
│   ├── page.tsx          # Dashboard — backend status + section links
│   ├── globals.css       # Tailwind CSS imports and theme
│   ├── users/            # Users domain pages
│   ├── auth/             # Auth domain page (register + login)
│   ├── files/            # Files domain pages
│   ├── admin/            # Admin domain pages
│   └── sharing/          # Sharing domain pages
├── lib/                  # Shared application code
│   ├── types.ts          # Client-side DTO interfaces (mirrors backend)
│   └── api.ts            # Typed fetch wrappers for all backend routes
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md             # This file
```

---

## API Client (`lib/api.ts`)

A single API client module wraps every backend route with typed fetch calls.

- Base URL: `http://localhost:4000`
- All functions return typed promises using interfaces from `lib/types.ts`
- Errors are **not** swallowed — they propagate so pages can display them inline
- No authentication headers are sent (v0.0.7 scope)

---

## Version History

| Version | Milestone |
|---------|-----------|
| v0.0.4  | Next.js scaffold, static placeholder pages |
| v0.0.5  | Backend reachability test (`/ping` fetch) |
| v0.0.7  | Full contract integration — types, API client, domain pages |

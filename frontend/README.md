# Frontend

This directory contains the frontend application for **KC-Project**.

The frontend is implemented using **Next.js (App Router)** and provides
the user-facing interface for interacting with the backend API. Like
the backend, it is developed incrementally and intentionally lacks
strong security guarantees in early versions.

---

## Current Status

**Version:** v0.0.4 (Foundation Phase)

- Next.js application scaffolded
- App Router enabled
- Base layout and routing defined
- Static placeholder pages only
- No backend integration
- No authentication flow

At this stage, the frontend exists independently of the backend and
does not reflect real application behaviour.

---

## Purpose

The frontend will eventually be responsible for:
- User authentication flows
- Role-based UI rendering
- File management interactions
- Administrative interfaces
- Client-side navigation and state handling

The frontend is considered an **untrusted client** at all stages of
the project. All security enforcement is expected to occur server-side.

---

## Running the Frontend (Local Development)

```bash
cd frontend
npm install
npm run dev
# Backend

This directory contains the backend API for **KC-Project**.

The backend is implemented using **NestJS** and serves as the primary
application and trust boundary for the system. It is intentionally
developed in stages, with security controls introduced, omitted, and
later hardened according to the project roadmap.

---

## Current Status

**Version:** v0.0.3 → v0.0.4 (Foundation Phase)

- NestJS application scaffolded
- Core project structure defined
- Application boots locally
- Default placeholder controller only
- No domain-specific endpoints
- No authentication or authorization logic
- No database or persistent storage

At this stage, the backend exists to validate structure and runtime
behaviour only. No functional guarantees are provided.

---

## Purpose

The backend will eventually be responsible for:
- User authentication and session handling
- Role-based access control (RBAC)
- File metadata management
- Administrative functionality
- Serving a RESTful API consumed by the frontend and security tools

Security controls are intentionally minimal or absent in early versions
to support controlled vulnerability exploration in later phases.

---

## Running the Backend (Local Development)

```bash
cd backend
npm install
npm run start:dev
/**
 * v0.1.5 — Authentication Edge Cases
 *
 * CWE-615 WARNING: This file is client-side rendered ('use client' in consuming
 * components). All comments, function names, string literals, and the API_BASE
 * URL are shipped to the browser and visible in DevTools (Sources tab, Network
 * tab). In v1.0.0+ this constitutes information disclosure to attackers who can
 * read the full API surface, auth header logic, and vulnerability annotations
 * directly from the bundled JavaScript.
 * CWE-615 (Inclusion of Sensitive Information in Source Code Comments) | A02:2025
 * Remediation (v2.0.0): Strip comments via terser (comments: false), disable
 * source maps in production, move sensitive docs to server-side only.
 *
 * --- Purpose ---
 * Typed fetch wrappers for every backend route. One exported function per
 * controller endpoint. All functions use the shared request() helper which
 * handles headers, error propagation, and JSON parsing.
 *
 * --- Architecture ---
 * This module is the ONLY place the frontend communicates with the backend.
 * Components never call fetch() directly — they import functions from here.
 * This centralises:
 *   - The base URL (API_BASE)
 *   - Header construction (Content-Type + Authorization Bearer)
 *   - Error handling (network errors, HTTP errors)
 *   - Response typing (generics ensure callers get typed data)
 *
 * --- Auth header flow (v0.1.4) ---
 * getHeaders() reads the JWT from localStorage (key: 'kc_auth') and attaches
 * it as an Authorization: Bearer header on every request. This means:
 *   - All API calls are automatically authenticated if a token exists
 *   - The token is read from localStorage on every request (not cached in JS)
 *   - Public endpoints (register, login) also send the header — harmless but
 *     unnecessary (the backend ignores it on unprotected routes)
 */

import type {
  AdminResponse,
  AuthResponse,
  CreateAdmin,
  CreateSharing,
  CreateUser,
  DeleteResponse,
  FileResponse,
  LoginRequest,
  PingResponse,
  RegisterRequest,
  SharingResponse,
  UpdateAdmin,
  UpdateSharing,
  UpdateUser,
  UploadFileRequest,
  UserResponse,
} from './types';

/**
 * Backend base URL. Hardcoded to localhost:4000 for development.
 *
 * VULN: No TLS — all requests (including those carrying JWT tokens and
 * plaintext passwords in POST bodies) are sent over plain HTTP.
 * CWE-319 (Cleartext Transmission of Sensitive Information) | A04:2025
 * Remediation (v2.0.0): HTTPS via nginx TLS termination, HSTS header.
 */
const API_BASE = 'http://localhost:4000';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Build request headers, attaching the JWT Bearer token if one exists
 * in localStorage.
 *
 * VULN: Token is read directly from localStorage. Any XSS payload running
 * in the same origin can call localStorage.getItem('kc_auth') and steal
 * the JWT. There is no integrity check on the stored value.
 * CWE-922 (Insecure Storage of Sensitive Information) | A07:2025
 * Remediation (v2.0.0): Store refresh token in httpOnly secure cookie
 * (inaccessible to JS). Keep short-lived access token in memory only.
 *
 * VULN: No validation or expiry check on the token before sending. A
 * tampered or corrupted token is attached blindly — the backend will
 * reject it, but the client doesn't know until the 401 comes back.
 *
 * VULN: Token is sent over plain HTTP (see API_BASE above).
 * CWE-319 | A04:2025
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('kc_auth');
      if (raw) {
        const { token } = JSON.parse(raw) as { token?: string };
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Silently ignore parse errors — corrupted localStorage entry
      // results in an unauthenticated request, not a crash
    }
  }
  return headers;
}

/**
 * Build auth-only headers (Authorization only, no Content-Type).
 *
 * Used for multipart/form-data requests where the browser must set the
 * Content-Type boundary itself. Reuses the same JWT lookup as getHeaders().
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('kc_auth');
      if (raw) {
        const { token } = JSON.parse(raw) as { token?: string };
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Ignore corrupted localStorage entries
    }
  }
  return headers;
}

/**
 * Core request helper. All API functions delegate to this.
 *
 * - Builds headers via getHeaders() (Content-Type + optional Bearer token)
 * - Merges caller-provided RequestInit (method, body, etc.)
 * - Throws a user-friendly error on network failure (TypeError = server down)
 * - Throws on non-2xx HTTP responses with status + body for debugging
 * - Returns parsed JSON typed as T
 *
 * Note: the ...init spread means caller-provided headers would override
 * getHeaders(). Currently no callers pass custom headers, so this is fine.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: getHeaders(),
      ...init,
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        'Unable to reach the server. Make sure the backend is running on localhost:4000.',
      );
    }
    throw err;
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

/** POST helper — serialises body to JSON. */
function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

/** PUT helper — serialises body to JSON. */
function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

/** DELETE helper — no body. */
function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// ── Ping ─────────────────────────────────────────────────────────────
// GET /ping — health check, confirms backend is reachable

export const ping = () => request<PingResponse>('/ping');

// ── Users ────────────────────────────────────────────────────────────
// CRUD operations on /users. These are the raw user management endpoints
// (separate from auth). Currently unprotected — no guard on the backend.

export const usersCreate = (dto: CreateUser) => post<UserResponse>('/users', dto);

export const usersList = () => request<UserResponse[]>('/users');

export const usersGetById = (id: string) => request<UserResponse>(`/users/${id}`);

export const usersUpdate = (id: string, dto: UpdateUser) => put<UserResponse>(`/users/${id}`, dto);

export const usersDelete = (id: string) => del<DeleteResponse>(`/users/${id}`);

// ── Auth ─────────────────────────────────────────────────────────────
// Authentication endpoints. register and login are public (no token needed).
// /auth/me is protected by JwtAuthGuard on the backend — requires a valid
// Bearer token which getHeaders() attaches automatically.

export const authRegister = (dto: RegisterRequest) => post<AuthResponse>('/auth/register', dto);

export const authLogin = (dto: LoginRequest) => post<AuthResponse>('/auth/login', dto);

/** GET /auth/me — fetch the currently authenticated user's profile using the stored JWT. */
export const authMe = () => request<UserResponse>('/auth/me');

/**
 * POST /auth/logout — calls the backend logout endpoint.
 *
 * The backend does NOTHING with this request (v0.1.4). It returns a cosmetic
 * success message but does not revoke the JWT, update a deny-list, or clear
 * any server-side session. The token remains cryptographically valid and
 * replayable by any attacker who intercepted it.
 *
 * The frontend calls this fire-and-forget (does not await or handle errors)
 * before clearing localStorage. Even if the backend were to revoke the token
 * in the future, the client would still need to clear local state anyway.
 *
 * VULN: Cosmetic logout — server confirms "logged out" but the JWT lives on.
 *       CWE-613 (Insufficient Session Expiration) | A07:2025
 *       Remediation (v2.0.0): POST /auth/logout deletes refresh token from DB.
 *       Frontend clears httpOnly cookie via Set-Cookie maxAge=0 from backend.
 */
export const authLogout = () =>
  request<{ message: string }>('/auth/logout', { method: 'POST' });

// ── Files ────────────────────────────────────────────────────────────
// File management endpoints. Backed by real Multer multipart uploads
// on the backend (v0.3.x).
//
// VULN (v0.3.0): The backend trusts the client-supplied filename and
// Content-Type from the multipart upload. This wrapper intentionally
// does not sanitise them.

/**
 * Multipart upload helper for POST /files.
 *
 * Sends the given File under the "file" field and optional description
 * as plain text. No client-side validation beyond presence of the File.
 */
export async function filesUploadMultipart(
  file: File,
  description?: string,
): Promise<FileResponse> {
  const form = new FormData();
  form.append('file', file);
  if (description) {
    form.append('description', description);
  }

  const res = await fetch(`${API_BASE}/files`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }

  return res.json() as Promise<FileResponse>;
}

export const filesGetById = (id: string) => request<FileResponse>(`/files/${id}`);

export const filesList = () => request<FileResponse[]>('/files');

export const filesDelete = (id: string) => del<DeleteResponse>(`/files/${id}`);

/**
 * Download helper for GET /files/:id/download.
 *
 * Returns a Blob so callers can create an object URL and trigger a download
 * while still sending the Authorization header (JwtAuthGuard on backend).
 */
export async function filesDownload(id: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/files/${id}/download`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }

  return res.blob();
}

// ── Sharing ──────────────────────────────────────────────────────────
// File sharing endpoints. Backed by real DB rows and predictable
// public tokens in v0.3.4.

export const sharingCreate = (dto: CreateSharing) => post<SharingResponse>('/sharing', dto);

export const sharingList = () => request<SharingResponse[]>('/sharing');

export const sharingGetById = (id: string) => request<SharingResponse>(`/sharing/${id}`);

export const sharingUpdate = (id: string, dto: UpdateSharing) =>
  put<SharingResponse>(`/sharing/${id}`, dto);

export const sharingDelete = (id: string) => del<DeleteResponse>(`/sharing/${id}`);

/**
 * Convenience helper: absolute URL for GET /sharing/public/:token.
 *
 * This endpoint is intentionally unauthenticated on the backend.
 */
export const sharingPublicUrl = (token: string) => `${API_BASE}/sharing/public/${token}`;

// ── Admin ────────────────────────────────────────────────────────────
// Administrative endpoints. Currently stub routes on the backend.

export const adminCreate = (dto: CreateAdmin) => post<AdminResponse>('/admin', dto);

export const adminList = () => request<AdminResponse[]>('/admin');

export const adminGetById = (id: string) => request<AdminResponse>(`/admin/${id}`);

export const adminUpdate = (id: string, dto: UpdateAdmin) =>
  put<AdminResponse>(`/admin/${id}`, dto);

export const adminDelete = (id: string) => del<DeleteResponse>(`/admin/${id}`);

// ── Admin Users (v0.4.1) ──────────────────────────────────────────────
// v0.4.1: User management endpoints (admin-only, weak authorization).
// CWE-639: Role from JWT trusted, not re-validated from DB.
// CWE-862: No additional authorization checks.
// CWE-200: All user emails exposed.
// CWE-400: Unbounded list.

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminUsersResponse {
  users: AdminUser[];
  count: number;
}

export interface UpdateUserRoleRequest {
  role: 'user' | 'admin';
}

export interface UpdateUserRoleResponse {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /admin/users — List all users (admin only)
 * CWE-200: All user emails exposed
 * CWE-400: Unbounded list dump
 * CWE-639: Trusts 'admin' role from JWT
 */
export const adminListUsers = () => request<GetAdminUsersResponse>('/admin/users');

/**
 * PUT /admin/users/:id/role — Update a user's role (admin only)
 * CWE-862: No additional auth checks
 * CWE-532: No audit trail
 */
export const adminUpdateUserRole = (userId: string, role: 'user' | 'admin') =>
  put<UpdateUserRoleResponse>(`/admin/users/${userId}/role`, { role });

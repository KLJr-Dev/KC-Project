/**
 * Frontend API client (v2.1.0).
 *
 * Security measures:
 * - CWE-922: Access JWT read from in-memory holder (access-token.ts), not localStorage.
 * - CWE-922 / CWE-1004: `credentials: 'include'` so the browser sends the httpOnly
 *   refresh cookie; JS never reads that cookie.
 * - CWE-352: Refresh calls send `X-Requested-With: XMLHttpRequest` (CSRF header).
 * - CWE-613: On 401, one silent refresh then retry; logout clears memory + cookie via API.
 *
 * API_BASE is `/api` behind nginx (same-site). Prefer TLS lab profile for non-loopback.
 */
import type {
  AuthResponse,
  CreateSharing,
  CreateUser,
  DeleteResponse,
  FileResponse,
  LoginRequest,
  RegisterRequest,
  SharingResponse,
  UpdateSharing,
  UpdateUser,
  UploadFileRequest,
  UserResponse,
} from './types';
import { clearAccessToken, getAccessToken, setAccessToken } from './access-token';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** CSRF header required by POST /auth/refresh (M6). */
const CSRF_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' } as const;

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Structured validation error response from backend ValidationExceptionFilter.
 * Provides field-level constraint messages for form display.
 */
export interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Custom error class that wraps ValidationErrorResponse for structured errors.
 * Allows components to check if error is validation-related and access field errors.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}

export class ValidationError extends Error {
  public readonly errors: Record<string, string[]>;
  public readonly statusCode: number;
  public readonly timestamp?: string;

  constructor(response: ValidationErrorResponse) {
    super(response.message);
    this.statusCode = response.statusCode;
    this.errors = response.errors || {};
    this.timestamp = response.timestamp;
    this.name = 'ValidationError';
  }
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly timestamp?: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.statusCode = response.statusCode;
    this.timestamp = response.timestamp;
    this.name = 'ApiError';
  }
}

/** Paginated list shape returned by GET /files, /sharing, /users since v0.5.2. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  take: number;
}

async function listItems<T>(path: string): Promise<T[]> {
  const res = await request<PaginatedResponse<T>>(path);
  return res.items ?? [];
}

/**
 * Core request helper. All API functions delegate to this.
 *
 * - Builds headers via getHeaders() (Content-Type + optional Bearer token)
 * - Merges caller-provided RequestInit (method, body, etc.)
 * - Throws a user-friendly error on network failure (TypeError = server down)
 * - Parses ValidationErrorResponse (400) into ValidationError with field errors
 * - Throws on other non-2xx HTTP responses with status + body for debugging
 * - Returns parsed JSON typed as T
 *
 * Note: the ...init spread means caller-provided headers would override
 * getHeaders(). Currently no callers pass custom headers, so this is fine.
 */
async function request<T>(path: string, init?: RequestInit, allowRefresh = true): Promise<T> {
  const headers = {
    ...getHeaders(),
    ...(init?.headers as Record<string, string> | undefined),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        `Unable to reach the server at ${API_BASE}. Make sure the backend is running.`,
      );
    }
    throw err;
  }

  // Silent refresh once on expired access JWT (refresh cookie + CSRF header).
  if (res.status === 401 && allowRefresh && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      const refreshed = await authRefresh();
      setAccessToken(refreshed.token);
      return request<T>(path, init, false);
    } catch {
      clearAccessToken();
    }
  }

  if (!res.ok) {
    const body = await res.text();
    try {
      const json = JSON.parse(body) as ApiErrorResponse;
      if (json.statusCode === 400 && json.errors) {
        throw new ValidationError(json);
      }
      if (json.statusCode && json.message) {
        throw new ApiError(json);
      }
      throw new Error(`${res.status} ${res.statusText}: ${body}`);
    } catch (parseErr) {
      if (parseErr instanceof ValidationError || parseErr instanceof ApiError) {
        throw parseErr;
      }
      throw new Error(`${res.status} ${res.statusText}: ${body}`);
    }
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

// ── Users ────────────────────────────────────────────────────────────
// CRUD operations on /users. These are the raw user management endpoints
// (separate from auth). Currently unprotected — no guard on the backend.

export const usersCreate = (dto: CreateUser) => post<UserResponse>('/users', dto);

export const usersList = () => listItems<UserResponse>('/users');

export const usersGetById = (id: string) => request<UserResponse>(`/users/${id}`);

export const usersUpdate = (id: string, dto: UpdateUser) => put<UserResponse>(`/users/${id}`, dto);

export const usersDelete = (id: string) => del<DeleteResponse>(`/users/${id}`);

// ── Auth ─────────────────────────────────────────────────────────────
// register/login set httpOnly refresh cookie (Set-Cookie) and return access JWT.
// Access token is stored in memory by AuthProvider / setAccessToken.

async function captureAccess(session: AuthResponse): Promise<AuthResponse> {
  setAccessToken(session.token);
  return session;
}

export const authRegister = async (dto: RegisterRequest) =>
  captureAccess(await post<AuthResponse>('/auth/register', dto));

export const authLogin = async (dto: LoginRequest) =>
  captureAccess(await post<AuthResponse>('/auth/login', dto));

/**
 * POST /auth/refresh — cookie + CSRF header; rotates refresh, returns new access JWT.
 */
export async function authRefresh(): Promise<AuthResponse> {
  const session = await request<AuthResponse>(
    '/auth/refresh',
    {
      method: 'POST',
      headers: { ...CSRF_HEADERS, 'Content-Type': 'application/json' },
      body: '{}',
    },
    false,
  );
  setAccessToken(session.token);
  return session;
}

/** GET /auth/me — requires in-memory access JWT. */
export const authMe = () => request<UserResponse>('/auth/me');

/**
 * POST /auth/logout — revokes refresh rows and clears httpOnly cookie.
 * Caller should clearAccessToken() / AuthProvider state afterward.
 */
export async function authLogout(): Promise<{ message: string }> {
  try {
    return await request<{ message: string }>('/auth/logout', { method: 'POST' }, false);
  } finally {
    clearAccessToken();
  }
}

// ── Files ────────────────────────────────────────────────────────────
// Multipart upload helper. Backend sanitizes filenames + enforces size/ownership.

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
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }

  return res.json() as Promise<FileResponse>;
}

export const filesGetById = (id: string) => request<FileResponse>(`/files/${id}`);

export const filesList = () => listItems<FileResponse>('/files');

export const filesDelete = (id: string) => del<DeleteResponse>(`/files/${id}`);

export const filesApprove = (id: string, status: 'approved' | 'rejected') =>
  put<FileResponse>(`/files/${id}/approve`, { status });

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
    credentials: 'include',
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

export const sharingList = () => listItems<SharingResponse>('/sharing');

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

/** Product UI: friendly landing page (frontend route, not API). */
export const sharingFriendlyUrl = (token: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${token}`;
  }
  return `/share/${token}`;
};

// ── Admin Users ───────────────────────────────────────────────────────
// Admin-only endpoints; backend HasRoleGuard (DB role) is authoritative.
// CWE-639: Role from JWT trusted, not re-validated from DB.
// CWE-862: No additional authorization checks.
// CWE-200: All user emails exposed.
// CWE-400: Unbounded list.

export type AdminRole = 'user' | 'moderator' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminUsersResponse {
  items: AdminUser[];
  users: AdminUser[];
  total: number;
  count: number;
  skip: number;
  take: number;
}

export interface AdminStatsResponse {
  userCount: number;
  fileCount: number;
  shareCount: number;
  storageBytesEstimate: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface UpdateUserRoleRequest {
  role: AdminRole;
}

export interface UpdateUserRoleResponse {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /admin/users — List all users (admin only)
 * CWE-200: All user emails exposed
 * CWE-400: Unbounded list dump
 * CWE-639: Trusts 'admin' role from JWT
 */
export const adminListUsers = (params?: {
  search?: string;
  role?: string;
  skip?: number;
  take?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.role) query.set('role', params.role);
  if (params?.skip !== undefined) query.set('skip', String(params.skip));
  if (params?.take !== undefined) query.set('take', String(params.take));
  const qs = query.toString();
  return request<GetAdminUsersResponse>(`/admin/users${qs ? `?${qs}` : ''}`);
};

export const adminGetStats = () => request<AdminStatsResponse>('/admin/stats');

export const adminGetAuditLogs = () => request<AuditLogEntry[]>('/admin/audit-logs');

/**
 * PUT /admin/users/:id/role — Update a user's role (admin only)
 * CWE-862: No additional auth checks
 * CWE-532: No audit trail
 */
export const adminUpdateUserRole = (userId: string, role: AdminRole) =>
  put<UpdateUserRoleResponse>(`/admin/users/${userId}/role`, { role });

/** PUT /admin/users/:id/role/escalate — moderator escalation chain (CWE-269) */
export const adminEscalateUserRole = (userId: string) =>
  put<UpdateUserRoleResponse>(`/admin/users/${userId}/role/escalate`, {});

/** DELETE /admin/users/:id — missing HasRole guard (CWE-862) */
export const adminDeleteUser = (userId: string) => del<DeleteResponse>(`/admin/users/${userId}`);

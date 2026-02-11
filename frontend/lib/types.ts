/**
 * v0.0.7 — Frontend ↔ Backend Contract Integration
 *
 * Client-side mirrors of every backend DTO. Plain interfaces only —
 * no classes, no decorators, no runtime. Source of truth lives in
 * backend/src/* /dto/; these will be replaced by OpenAPI codegen in v0.0.8.
 */

// ── Users ────────────────────────────────────────────────────────────

export interface CreateUser {
  email?: string;
  username?: string;
  password?: string;
}

export interface UpdateUser {
  email?: string;
  username?: string;
  password?: string;
}

export interface UserResponse {
  id: string;
  email?: string;
  username?: string;
  createdAt: string;
}

// ── Auth ─────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email?: string;
  password?: string;
  username?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  message?: string;
}

// ── Files ────────────────────────────────────────────────────────────

export interface UploadFileRequest {
  filename?: string;
}

export interface FileResponse {
  id: string;
  filename: string;
  size?: number;
  uploadedAt: string;
}

// ── Sharing ──────────────────────────────────────────────────────────

export interface CreateSharing {
  fileId?: string;
  public?: boolean;
  expiresAt?: string;
}

export interface UpdateSharing {
  public?: boolean;
  expiresAt?: string;
}

export interface SharingResponse {
  id: string;
  fileId?: string;
  public?: boolean;
  createdAt: string;
  expiresAt?: string;
}

// ── Admin ────────────────────────────────────────────────────────────

export interface CreateAdmin {
  label?: string;
  role?: string;
}

export interface UpdateAdmin {
  label?: string;
  role?: string;
}

export interface AdminResponse {
  id: string;
  label?: string;
  role?: string;
  createdAt: string;
}

// ── Infrastructure ───────────────────────────────────────────────────

export interface PingResponse {
  status: string;
  service: string;
}

// ── Generic ──────────────────────────────────────────────────────────

export interface DeleteResponse {
  deleted: string;
}

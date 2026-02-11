/**
 * v0.0.7 — Frontend ↔ Backend Contract Integration
 *
 * Typed fetch wrappers for every backend route. One function per
 * controller method. Errors propagate — callers are responsible for
 * displaying them.
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

const API_BASE = 'http://localhost:4000';

// ── Helpers ──────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// ── Ping ─────────────────────────────────────────────────────────────

export const ping = () => request<PingResponse>('/ping');

// ── Users ────────────────────────────────────────────────────────────

export const usersCreate = (dto: CreateUser) =>
  post<UserResponse>('/users', dto);

export const usersList = () => request<UserResponse[]>('/users');

export const usersGetById = (id: string) =>
  request<UserResponse>(`/users/${id}`);

export const usersUpdate = (id: string, dto: UpdateUser) =>
  put<UserResponse>(`/users/${id}`, dto);

export const usersDelete = (id: string) =>
  del<DeleteResponse>(`/users/${id}`);

// ── Auth ─────────────────────────────────────────────────────────────

export const authRegister = (dto: RegisterRequest) =>
  post<AuthResponse>('/auth/register', dto);

export const authLogin = (dto: LoginRequest) =>
  post<AuthResponse>('/auth/login', dto);

// ── Files ────────────────────────────────────────────────────────────

export const filesUpload = (dto: UploadFileRequest) =>
  post<FileResponse>('/files', dto);

export const filesGetById = (id: string) =>
  request<FileResponse>(`/files/${id}`);

export const filesDelete = (id: string) =>
  del<DeleteResponse>(`/files/${id}`);

// ── Sharing ──────────────────────────────────────────────────────────

export const sharingCreate = (dto: CreateSharing) =>
  post<SharingResponse>('/sharing', dto);

export const sharingList = () => request<SharingResponse[]>('/sharing');

export const sharingGetById = (id: string) =>
  request<SharingResponse>(`/sharing/${id}`);

export const sharingUpdate = (id: string, dto: UpdateSharing) =>
  put<SharingResponse>(`/sharing/${id}`, dto);

export const sharingDelete = (id: string) =>
  del<DeleteResponse>(`/sharing/${id}`);

// ── Admin ────────────────────────────────────────────────────────────

export const adminCreate = (dto: CreateAdmin) =>
  post<AdminResponse>('/admin', dto);

export const adminList = () => request<AdminResponse[]>('/admin');

export const adminGetById = (id: string) =>
  request<AdminResponse>(`/admin/${id}`);

export const adminUpdate = (id: string, dto: UpdateAdmin) =>
  put<AdminResponse>(`/admin/${id}`, dto);

export const adminDelete = (id: string) =>
  del<DeleteResponse>(`/admin/${id}`);

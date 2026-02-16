/**
 * v0.0.8 — Frontend types derived from OpenAPI spec
 *
 * Re-exports schema types from the auto-generated types.gen.ts with
 * friendly aliases. All pages and api.ts import from here so import
 * paths stay stable even if the codegen output changes.
 *
 * To regenerate: npm run generate:types (requires backend on :4000)
 */

import type { components } from './types.gen';

// ── Users ────────────────────────────────────────────────────────────

export type CreateUser = components['schemas']['CreateUserDto'];
export type UpdateUser = components['schemas']['UpdateUserDto'];
export type UserResponse = components['schemas']['UserResponseDto'];

// ── Auth ─────────────────────────────────────────────────────────────

export type RegisterRequest = components['schemas']['RegisterDto'];
export type LoginRequest = components['schemas']['LoginDto'];
export type AuthResponse = components['schemas']['AuthResponseDto'];

// ── Files ────────────────────────────────────────────────────────────

export type UploadFileRequest = components['schemas']['UploadFileDto'];
export type FileResponse = components['schemas']['FileResponseDto'];

// ── Sharing ──────────────────────────────────────────────────────────

export type CreateSharing = components['schemas']['CreateSharingDto'];
export type UpdateSharing = components['schemas']['UpdateSharingDto'];
export type SharingResponse = components['schemas']['SharingResponseDto'];

// ── Admin ────────────────────────────────────────────────────────────

export type CreateAdmin = components['schemas']['CreateAdminDto'];
export type UpdateAdmin = components['schemas']['UpdateAdminDto'];
export type AdminResponse = components['schemas']['AdminResponseDto'];

// ── Infrastructure ───────────────────────────────────────────────────

export interface PingResponse {
  status: string;
  service: string;
}

// ── Generic ──────────────────────────────────────────────────────────

export interface DeleteResponse {
  deleted: string;
}

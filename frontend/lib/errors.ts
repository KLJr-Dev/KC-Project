import { ApiError, ValidationError } from './api';

export function formatUserError(err: unknown): string {
  if (err instanceof ValidationError) {
    return err.message || 'Please check the highlighted fields.';
  }
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes('413')) {
      return 'File too large (max 1 MB through the proxy). See /dev for API details.';
    }
    if (msg.includes('Failed to fetch') || msg.includes('Unable to reach')) {
      return 'Cannot reach the server. Is the backend running?';
    }
    return msg;
  }
  return String(err);
}

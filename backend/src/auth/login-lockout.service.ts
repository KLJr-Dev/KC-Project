/**
 * Soft login lockout — 5 failures / 15 minutes per email+IP (v2.10.0).
 * In-memory map is sufficient for single-instance showcase tip.
 */
import { Injectable } from '@nestjs/common';

type Bucket = { fails: number; lockedUntil: number };

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class LoginLockoutService {
  private readonly buckets = new Map<string, Bucket>();

  private key(email: string, ip: string): string {
    return `${email.trim().toLowerCase()}|${ip || 'unknown'}`;
  }

  isLocked(email: string, ip: string): boolean {
    const b = this.buckets.get(this.key(email, ip));
    if (!b) return false;
    if (b.lockedUntil && Date.now() < b.lockedUntil) return true;
    if (b.lockedUntil && Date.now() >= b.lockedUntil) {
      this.buckets.delete(this.key(email, ip));
    }
    return false;
  }

  /** @returns true if this failure triggered a new lockout */
  recordFailure(email: string, ip: string): boolean {
    const k = this.key(email, ip);
    const now = Date.now();
    let b = this.buckets.get(k);
    if (!b || (b.lockedUntil && now >= b.lockedUntil)) {
      b = { fails: 0, lockedUntil: 0 };
    }
    b.fails += 1;
    if (b.fails >= MAX_FAILS) {
      b.lockedUntil = now + WINDOW_MS;
      this.buckets.set(k, b);
      return true;
    }
    this.buckets.set(k, b);
    return false;
  }

  clear(email: string, ip: string): void {
    this.buckets.delete(this.key(email, ip));
  }
}

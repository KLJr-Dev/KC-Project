/**
 * Cycle-10 Stage-0 — hidden document-staff access request (`/staff-access`).
 *
 * Public route (no auth). Discovery plant: HTML comment on `/` + edge static.
 * POST /access-requests → Nest creates **moderator** (never admin).
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { accessRequestSubmit, ValidationError } from '../../lib/api';
import FormInput from '../components/ui/form-input';
import SubmitButton from '../components/ui/submit-button';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
}

function validateUsername(username: string): string | null {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 50) return 'Username must be at most 50 characters';
  return null;
}

/** Mirrors Nest password-policy (length 12 + complexity). */
function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 12) return 'Password must be at least 12 characters';
  if (password.length > 128) return 'Password must not exceed 128 characters';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)) {
    return 'Include uppercase, lowercase, a digit, and a special character';
  }
  return null;
}

export default function StaffAccessPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string | null> = {
      email: validateEmail(email),
      username: validateUsername(username),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await accessRequestSubmit({
        email,
        username,
        password,
        reason: reason.trim() || undefined,
      });
      setSuccess(
        `${res.message} Your Document Ops role will be ${res.role}. Continue at Sign in.`,
      );
      setPassword('');
    } catch (err) {
      if (err instanceof ValidationError) {
        const next: Record<string, string | null> = {};
        for (const [k, msgs] of Object.entries(err.errors)) {
          next[k] = msgs[0] ?? err.message;
        }
        setFieldErrors(next);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      <div className="space-y-3">
        <span className="nw-stamp">Document Ops</span>
        <h1 className="text-2xl font-semibold text-foreground">
          Staff access request
        </h1>
        <p className="text-sm text-muted">
          Document Operations accounts are issued for packet intake and partner-drop
          review. Self-service portal registration does not include Document Ops.
        </p>
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted">
          Policy NW-DO-14: access is limited to document staff. Requests are reviewed
          against department staffing. Do not share credentials across desks.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-5">
        <FormInput
          id="staff-email"
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          placeholder="you@northwind.lab"
          autoComplete="email"
          required
        />
        <FormInput
          id="staff-username"
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          error={fieldErrors.username}
          placeholder="docs.ops"
          autoComplete="username"
          required
        />
        <FormInput
          id="staff-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />
        <div>
          <label className="mb-1 block text-sm text-foreground">
            Business reason <span className="text-muted">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Q4 vendor packet intake — Document Ops desk"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <SubmitButton loading={loading}>Submit access request</SubmitButton>
      </form>

      <p className="text-sm text-muted">
        Already provisioned?{' '}
        <Link href="/auth?mode=login&next=/packets" className="underline text-foreground">
          Sign in to Document Ops
        </Link>
      </p>
    </div>
  );
}

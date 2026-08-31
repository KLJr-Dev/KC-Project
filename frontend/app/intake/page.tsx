'use client';

/**
 * Northwind Intake — Cycle-9 SoftDev (`v1.6.0`).
 * Staff search + onboarding requests via Nest BFF → FastAPI (never intake:8000).
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  intakeSearch,
  intakeListOnboardingRequests,
  intakeCreateOnboardingRequest,
  type IntakeSearchResult,
  type OnboardingRequest,
} from '../../lib/api';
import { formatUserError } from '../../lib/errors';
import { useAuth } from '../../lib/auth-context';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function IntakePage() {
  return (
    <RequireAuth>
      <IntakeContent />
    </RequireAuth>
  );
}

function IntakeContent() {
  const { isModerator, isAdmin } = useAuth();
  const [q, setQ] = useState('');
  const [searchResult, setSearchResult] = useState<IntakeSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [items, setItems] = useState<OnboardingRequest[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Ops');
  const [last4, setLast4] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const data = await intakeListOnboardingRequests();
      setItems(data.items);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setError(null);
    setSearchResult(null);
    try {
      setSearchResult(await intakeSearch(q.trim()));
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await intakeCreateOnboardingRequest({
        employee_email: email.trim(),
        department: department.trim(),
        national_id_last4: last4.trim() || undefined,
        manager_note: note.trim() || undefined,
      });
      setSuccess(`Request ${created.id} submitted`);
      setEmail('');
      setLast4('');
      setNote('');
      await loadRequests();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Ops Intake</h1>
        <p className="text-sm text-muted">
          Staff directory and onboarding / HR requests for Northwind. Routed through the platform
          gateway.
        </p>
        {(isModerator || isAdmin) && (
          <p className="text-sm text-muted">
            Moderators:{' '}
            <Link href="/intake/queue" className="text-foreground underline">
              Onboarding queue →
            </Link>
          </p>
        )}
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Directory search</h2>
        <form onSubmit={handleSearch} className="space-y-4 rounded-md border border-border p-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Query</span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="name, email, or department"
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {searchLoading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {searchLoading && <LoadingSpinner label="Searching directory…" />}

        {searchResult && (
          <div className="space-y-3 rounded-md border border-border p-6">
            <p className="text-sm text-muted">
              {searchResult.count} result{searchResult.count === 1 ? '' : 's'} for{' '}
              <span className="font-mono text-foreground">
                {searchResult.query || '(empty)'}
              </span>
            </p>
            <ul className="divide-y divide-border">
              {searchResult.results.map((row) => (
                <li
                  key={`${row.username}-${row.email}`}
                  className="space-y-1 py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-foreground">
                    {row.username}{' '}
                    <span className="font-normal text-muted">· {row.department ?? '—'}</span>
                  </p>
                  <p className="text-xs text-muted">{row.email}</p>
                  {row.notes && <p className="text-xs text-muted">{row.notes}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Submit onboarding request</h2>
        <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-border p-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Employee email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="name@northwind.ops"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Department</span>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">National ID (last 4)</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="optional"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Manager note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="optional"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-foreground">Your requests</h2>
          <button
            type="button"
            onClick={loadRequests}
            className="text-sm text-muted underline hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-muted">
          List is scoped to your assignee id on the Intake hop. Staff may still open known request
          ids via the API.
        </p>
        {listLoading ? (
          <LoadingSpinner label="Loading requests…" />
        ) : items.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="Submit an onboarding request above to see it here."
          />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {items.map((req) => (
              <li key={req.id} className="space-y-1 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  #{req.id}{' '}
                  <span className="font-normal text-muted">· {req.status}</span>
                </p>
                <p className="text-xs text-muted">
                  {req.employee_email} · {req.department}
                  {req.national_id_last4 ? ` · ****${req.national_id_last4}` : ''}
                </p>
                {req.manager_note && <p className="text-xs text-muted">{req.manager_note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

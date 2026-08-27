'use client';

/**
 * Northwind Intake — Cycle-8 tip (`v1.5.0`).
 * Staff / mailbox directory UI → GET /api/intake/search (FastAPI behind nginx).
 * CYCLE8-PLANT: search backend is intentionally injectable (sqlmap path).
 */
import { useState } from 'react';
import {
  intakeSearch,
  intakeServiceAccounts,
  type IntakeSearchResult,
  type IntakeServiceAccount,
} from '../../lib/api';
import { formatUserError } from '../../lib/errors';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function IntakePage() {
  return (
    <RequireAuth>
      <IntakeContent />
    </RequireAuth>
  );
}

function IntakeContent() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<IntakeSearchResult | null>(null);
  const [accounts, setAccounts] = useState<IntakeServiceAccount[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await intakeSearch(q.trim());
      setResult(data);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadServiceAccounts = async () => {
    setError(null);
    try {
      const data = await intakeServiceAccounts();
      setAccounts(data.accounts);
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Ops Intake</h1>
        <p className="text-sm text-muted">
          Search Northwind staff and mailbox directory entries for intake routing.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

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
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {loading && <LoadingSpinner />}

      {result && (
        <div className="space-y-3 rounded-md border border-border p-6">
          <p className="text-sm text-muted">
            {result.count} result{result.count === 1 ? '' : 's'} for{' '}
            <span className="font-mono text-foreground">{result.query || '(empty)'}</span>
          </p>
          <ul className="divide-y divide-border">
            {result.results.map((row) => (
              <li key={`${row.username}-${row.email}`} className="space-y-1 py-3 first:pt-0 last:pb-0">
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

      {/* CYCLE8-DECOY D2 — legacy service-account panel; creds fail on FTP/SMTP */}
      <div className="space-y-3 rounded-md border border-border p-6">
        <h2 className="text-sm font-medium text-foreground">Legacy service accounts</h2>
        <p className="text-sm text-muted">
          Internal integration credentials for staged cutover. Prefer SSO for interactive
          access.
        </p>
        <button
          type="button"
          onClick={loadServiceAccounts}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/30"
        >
          Load directory
        </button>
        {accounts && (
          <ul className="space-y-2 font-mono text-xs text-muted">
            {accounts.map((a) => (
              <li key={`${a.username}-${a.service}`}>
                {a.service}: {a.username} / {a.password}
                {a.note ? ` — ${a.note}` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

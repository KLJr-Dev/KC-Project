'use client';

/**
 * Security Ops — Cycle-9 Blue (`v2.6.0`).
 * Admin-only event feed; posture copy is informational (not a control plane).
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  intakeSecurityEvents,
  intakeSecurityMetrics,
  type SecurityEvent,
  type SecurityMetricsResult,
} from '../../../lib/api';
import { formatUserError } from '../../../lib/errors';
import RequireRole from '../../components/require-role';
import ErrorBanner from '../../components/ui/error-banner';
import LoadingSpinner from '../../components/ui/loading-spinner';
import EmptyState from '../../components/ui/empty-state';

export default function AdminSecurityPage() {
  return (
    <RequireRole roles={['admin']}>
      <SecurityPosture />
    </RequireRole>
  );
}

function SecurityPosture() {
  const [metrics, setMetrics] = useState<SecurityMetricsResult | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, e] = await Promise.all([intakeSecurityMetrics(), intakeSecurityEvents()]);
      setMetrics(m);
      setEvents(e.events);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Security Ops</h1>
        <p className="mt-1 text-sm text-muted">
          Onboarding squad event feed for admins. This page is not a live control plane —
          JWT and Intake authz are enforced on the API.{' '}
          <Link href="/admin" className="text-foreground underline">
            Admin home
          </Link>
        </p>
      </div>

      <ErrorBanner message={error} />

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-foreground">Feed health</h2>
        {metrics ? (
          <p className="text-sm text-muted">
            Uptime {metrics.uptime_hours}h · open requests {metrics.open_requests} · events{' '}
            {metrics.events_ingested}
          </p>
        ) : loading ? (
          <LoadingSpinner label="Loading metrics…" />
        ) : (
          <p className="text-sm text-muted">Metrics unavailable.</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-foreground">Security events</h2>
          <button
            type="button"
            onClick={load}
            className="text-sm text-muted underline hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <LoadingSpinner label="Loading events…" />
        ) : events.length === 0 ? (
          <EmptyState title="No events" description="Intake event feed is empty." />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {events.map((ev) => (
              <li key={ev.id} className="space-y-1 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {ev.action}{' '}
                  <span className="font-normal text-muted">· {ev.actor ?? '—'}</span>
                </p>
                <p className="text-xs text-muted">{ev.ts}</p>
                {ev.detail && (
                  <p className="break-all font-mono text-xs text-foreground">{ev.detail}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

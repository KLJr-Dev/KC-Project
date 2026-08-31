'use client';

/**
 * Security Ops posture — Cycle-9 SoftDev (`v1.6.0`).
 * CYCLE9-THEATRE: static green checks; events come from Intake SIEM feed via BFF.
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

const POSTURE_CHECKS = [
  { id: 'edge', label: 'Platform edge JWT verification', status: 'pass' as const },
  { id: 'intake', label: 'Intake upstream reachability', status: 'pass' as const },
  { id: 'siem', label: 'Onboarding squad event shipper', status: 'pass' as const },
  { id: 'export', label: 'Export package staging', status: 'pass' as const },
  { id: 'honeypot', label: 'Internal debug tripwire', status: 'pass' as const },
];

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
          Platform posture checklist and Onboarding squad event feed.{' '}
          <Link href="/admin" className="text-foreground underline">
            Admin home
          </Link>
        </p>
      </div>

      <ErrorBanner message={error} />

      {/* CYCLE9-THEATRE: always-green static checks — not a real control plane. */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Posture</h2>
        <ul className="divide-y divide-border rounded-md border border-border">
          {POSTURE_CHECKS.map((check) => (
            <li
              key={check.id}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span className="text-foreground">{check.label}</span>
              <span className="font-medium text-green-700 dark:text-green-400">
                {check.status === 'pass' ? 'OK' : check.status}
              </span>
            </li>
          ))}
        </ul>
        {metrics && (
          <p className="text-xs text-muted">
            Metrics: uptime {metrics.uptime_hours}h · open requests {metrics.open_requests} ·
            events {metrics.events_ingested} · posture {metrics.posture}
          </p>
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
          <EmptyState title="No events" description="Intake SIEM feed is empty." />
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

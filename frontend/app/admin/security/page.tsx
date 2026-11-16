'use client';

/**
 * Defense Ops — Cycle-10 Blue (`v2.10.0`).
 * Tabs: Alerts | Audit | Intake — not a full SIEM (ADR-039).
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  adminAckAlert,
  adminGetAlerts,
  adminGetAuditLogs,
  intakeSecurityEvents,
  intakeSecurityMetrics,
  type AuditLogEntry,
  type SecurityAlert,
  type SecurityEvent,
  type SecurityMetricsResult,
} from '../../../lib/api';
import { formatUserError } from '../../../lib/errors';
import { formatDate } from '../../../lib/format';
import RequireRole from '../../components/require-role';
import ErrorBanner from '../../components/ui/error-banner';
import LoadingSpinner from '../../components/ui/loading-spinner';
import EmptyState from '../../components/ui/empty-state';

type Tab = 'alerts' | 'audit' | 'intake';

export default function AdminSecurityPage() {
  return (
    <RequireRole roles={['admin']}>
      <DefenseOps />
    </RequireRole>
  );
}

function DefenseOps() {
  const [tab, setTab] = useState<Tab>('alerts');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetricsResult | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, logs, m, e] = await Promise.all([
        adminGetAlerts(false),
        adminGetAuditLogs(),
        intakeSecurityMetrics().catch(() => null),
        intakeSecurityEvents().catch(() => ({ events: [] as SecurityEvent[] })),
      ]);
      setAlerts(a);
      setAuditLogs(logs);
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

  const ack = async (id: string) => {
    try {
      await adminAckAlert(id);
      setAlerts((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Defense Ops</h1>
        <p className="mt-1 text-sm text-muted">
          Alerts, Nest audit, and Intake event feed. Authz is enforced on the API — this
          page is an operations view, not a control plane.{' '}
          <Link href="/admin" className="text-foreground underline">
            Admin home
          </Link>
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {(
          [
            ['alerts', 'Alerts'],
            ['audit', 'Audit'],
            ['intake', 'Intake'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:bg-muted/30 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="ml-auto text-sm text-muted underline hover:text-foreground"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading Defense Ops…" />
      ) : tab === 'alerts' ? (
        alerts.length === 0 ? (
          <EmptyState title="No open alerts" description="Unacked Nest alerts appear here." />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    <span className="uppercase text-xs text-muted">{a.severity}</span>
                    {' · '}
                    {a.kind}
                  </p>
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted">{formatDate(a.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => ack(a.id)}
                  className="rounded-md border border-border px-3 py-1 text-xs hover:bg-muted/30"
                >
                  Ack
                </button>
              </li>
            ))}
          </ul>
        )
      ) : tab === 'audit' ? (
        auditLogs.length === 0 ? (
          <EmptyState title="No audit entries" description="Nest audit_log is empty." />
        ) : (
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto rounded-lg border border-border p-4 text-sm">
            {auditLogs.map((log) => (
              <li key={log.id} className="border-b border-border pb-2 last:border-0">
                <span className="text-muted">{formatDate(log.createdAt)}</span>
                {' — '}
                <span className="font-medium">{log.action}</span>
                {' by '}
                {log.actorId} on {log.targetId}
                {log.details && <span className="text-muted"> ({log.details})</span>}
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="space-y-4">
          {metrics ? (
            <p className="text-sm text-muted">
              Uptime {metrics.uptime_hours}h · open requests {metrics.open_requests} · events{' '}
              {metrics.events_ingested}
            </p>
          ) : (
            <p className="text-sm text-muted">Intake metrics unavailable.</p>
          )}
          {events.length === 0 ? (
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
        </div>
      )}
    </div>
  );
}

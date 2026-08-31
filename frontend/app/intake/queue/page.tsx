'use client';

/**
 * Onboarding approval queue — Cycle-9 SoftDev (`v1.6.0`).
 * Mod/admin JWT → Nest BFF fills X-User-Role for Intake status PUT.
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  intakeListOnboardingRequests,
  intakeUpdateOnboardingStatus,
  intakeExportOnboardingRequest,
  type OnboardingRequest,
} from '../../../lib/api';
import { formatUserError } from '../../../lib/errors';
import RequireRole from '../../components/require-role';
import ErrorBanner from '../../components/ui/error-banner';
import SuccessBanner from '../../components/ui/success-banner';
import EmptyState from '../../components/ui/empty-state';
import LoadingSpinner from '../../components/ui/loading-spinner';

export default function IntakeQueuePage() {
  return (
    <RequireRole roles={['moderator', 'admin']}>
      <OnboardingQueue />
    </RequireRole>
  );
}

function OnboardingQueue() {
  const [items, setItems] = useState<OnboardingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await intakeListOnboardingRequests();
      setItems(data.items);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActingId(id);
    setError(null);
    setSuccess(null);
    try {
      await intakeUpdateOnboardingStatus(id, status);
      setSuccess(`Request ${id} ${status}`);
      await load();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setActingId(null);
    }
  };

  const handleExport = async (req: OnboardingRequest) => {
    setError(null);
    const file = req.export_relpath || 'package.json';
    try {
      const blob = await intakeExportOnboardingRequest(req.id, file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.split('/').pop() || 'export.bin';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  const pending = items.filter((r) => r.status === 'pending');
  const others = items.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Onboarding queue</h1>
        <p className="mt-1 text-sm text-muted">
          Approve or reject HR / onboarding requests.{' '}
          <Link href="/intake" className="text-foreground underline">
            Back to Intake
          </Link>
        </p>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {loading ? (
        <LoadingSpinner label="Loading onboarding queue…" />
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Pending</h2>
            {pending.length === 0 ? (
              <EmptyState title="No pending requests" description="Queue is clear." />
            ) : (
              <div className="space-y-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        #{req.id} · {req.employee_email}
                      </p>
                      <p className="text-sm text-muted">
                        {req.department}
                        {req.national_id_last4 ? ` · ****${req.national_id_last4}` : ''}
                      </p>
                      {req.manager_note && (
                        <p className="mt-1 text-xs text-muted">{req.manager_note}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actingId === req.id}
                        onClick={() => handleStatus(req.id, 'approved')}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={actingId === req.id}
                        onClick={() => handleStatus(req.id, 'rejected')}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Processed</h2>
            {others.length === 0 ? (
              <EmptyState title="None yet" description="Approved or rejected requests appear here." />
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {others.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        #{req.id} · {req.status}
                      </p>
                      <p className="text-xs text-muted">
                        {req.employee_email} · {req.department}
                      </p>
                    </div>
                    {req.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleExport(req)}
                        className="rounded-md border border-border px-3 py-1.5 text-sm"
                      >
                        Download package
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

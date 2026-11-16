'use client';

import { useEffect, useState } from 'react';
import {
  adminListUsers,
  adminGetStats,
  adminGetAuditLogs,
  adminListAccessRequests,
  adminApproveAccessRequest,
  adminDenyAccessRequest,
  filesList,
  filesDownload,
  type AdminRole,
  type AdminUser,
  type AdminStatsResponse,
  type AuditLogEntry,
} from '../../lib/api';
import type { AccessRequestListItem, FileResponse } from '../../lib/types';
import { formatUserError } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import RequireRole from '../components/require-role';
import { AdminUserList } from '@/app/components/admin-user-list';
import FileTable from '../components/file-table';
import ErrorBanner from '../components/ui/error-banner';
import LoadingSpinner from '../components/ui/loading-spinner';
import EmptyState from '../components/ui/empty-state';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <RequireRole roles={['admin']}>
      <AdminDashboard />
    </RequireRole>
  );
}

function AdminDashboard() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [pendingAccess, setPendingAccess] = useState<AccessRequestListItem[]>([]);
  const [allFiles, setAllFiles] = useState<FileResponse[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAdminUsers = async (searchTerm = search) => {
    setUsersLoading(true);
    setError(null);
    try {
      const res = await adminListUsers({
        search: searchTerm || undefined,
        take: 50,
      });
      setAdminUsers(res.users ?? res.items);
      setUserCount(res.count ?? res.total);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setUsersLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      setStats(await adminGetStats());
    } catch {
      /* optional */
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAudit = async () => {
    try {
      setAuditLogs(await adminGetAuditLogs());
    } catch {
      /* optional */
    }
  };

  const loadPendingAccess = async () => {
    try {
      setPendingAccess(await adminListAccessRequests('pending'));
    } catch {
      /* optional */
    }
  };

  const loadFiles = async () => {
    setFilesLoading(true);
    try {
      setAllFiles(await filesList());
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileDownload = async (id: string, filename: string) => {
    setDownloadingId(id);
    setError(null);
    try {
      const blob = await filesDownload(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const refreshAll = () => {
    loadAdminUsers();
    loadStats();
    loadAudit();
    loadPendingAccess();
    loadFiles();
  };

  const reviewAccess = async (id: string, action: 'approve' | 'deny') => {
    setError(null);
    try {
      if (action === 'approve') await adminApproveAccessRequest(id);
      else await adminDenyAccessRequest(id);
      await loadPendingAccess();
      await loadAudit();
      await loadAdminUsers();
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleRoleChange = (_userId: string, _newRole: AdminRole) => {
    setTimeout(() => {
      loadAdminUsers();
      loadAudit();
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Users, Document Ops access queue, files, stats, and audit.{' '}
            <Link href="/admin/security" className="underline text-foreground">
              Defense Ops
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/30"
        >
          Refresh all
        </button>
      </div>

      <ErrorBanner message={error} />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          Document Ops access requests ({pendingAccess.length} pending)
        </h2>
        {pendingAccess.length === 0 ? (
          <p className="text-sm text-muted">No pending staff access requests.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {pendingAccess.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">
                    {r.username} · {r.email}
                  </p>
                  <p className="text-xs text-muted">{r.justification || 'No justification'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => reviewAccess(r.id, 'approve')}
                    className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewAccess(r.id, 'deny')}
                    className="rounded-md border border-border px-3 py-1 text-xs"
                  >
                    Deny
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {statsLoading ? (
        <LoadingSpinner label="Loading stats…" />
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Users', value: stats.userCount },
            { label: 'Files', value: stats.fileCount },
            { label: 'Shares', value: stats.shareCount },
            { label: 'Storage', value: `${stats.storageBytesEstimate} B` },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted">{c.label}</div>
              <div className="text-2xl font-bold text-foreground">{c.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">All files (system-wide)</h2>
        {filesLoading ? (
          <LoadingSpinner label="Loading files…" />
        ) : allFiles.length === 0 ? (
          <EmptyState title="No files" description="No files have been uploaded yet." />
        ) : (
          <FileTable
            files={allFiles}
            onDownload={handleFileDownload}
            downloadingId={downloadingId}
            showOwner
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            placeholder="Search email or username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => loadAdminUsers(search)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Search
          </button>
        </div>

        <h2 className="text-sm font-medium text-foreground">Users ({userCount})</h2>
        <AdminUserList
          users={adminUsers}
          isLoading={usersLoading}
          onRoleChange={handleRoleChange}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Audit log</h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-muted">No audit entries yet.</p>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-4 text-sm">
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
        )}
      </div>
    </div>
  );
}

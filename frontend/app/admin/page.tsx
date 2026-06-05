'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  adminListUsers,
  adminGetStats,
  adminGetAuditLogs,
  type AdminUser,
  type AdminStatsResponse,
  type AuditLogEntry,
} from '../../lib/api';
import { AdminUserList } from '@/app/components/admin-user-list';

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

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
      setError(`Failed to load users: ${String(err)}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStats(await adminGetStats());
    } catch {
      /* stats optional */
    }
  };

  const loadAudit = async () => {
    try {
      setAuditLogs(await adminGetAuditLogs());
    } catch {
      /* audit optional */
    }
  };

  useEffect(() => {
    loadAdminUsers();
    loadStats();
    loadAudit();
  }, []);

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    setTimeout(() => {
      loadAdminUsers();
      loadAudit();
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-black dark:text-zinc-100">Admin Dashboard</h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded border p-4 dark:border-zinc-700">
            <div className="text-sm text-zinc-500">Users</div>
            <div className="text-2xl font-bold">{stats.userCount}</div>
          </div>
          <div className="rounded border p-4 dark:border-zinc-700">
            <div className="text-sm text-zinc-500">Files</div>
            <div className="text-2xl font-bold">{stats.fileCount}</div>
          </div>
          <div className="rounded border p-4 dark:border-zinc-700">
            <div className="text-sm text-zinc-500">Shares</div>
            <div className="text-2xl font-bold">{stats.shareCount}</div>
          </div>
          <div className="rounded border p-4 dark:border-zinc-700">
            <div className="text-sm text-zinc-500">Storage (bytes)</div>
            <div className="text-2xl font-bold">{stats.storageBytesEstimate}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <input
            type="search"
            placeholder="Search email or username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 dark:bg-zinc-900 dark:border-zinc-700"
          />
          <button
            onClick={() => loadAdminUsers(search)}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold">All Users ({userCount})</h3>
          <button
            onClick={() => loadAdminUsers()}
            disabled={usersLoading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
          >
            {usersLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <AdminUserList
          users={adminUsers}
          isLoading={usersLoading}
          onRoleChange={handleRoleChange}
        />
      </div>

      {auditLogs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Audit Log</h3>
          <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded p-3 dark:border-zinc-700">
            {auditLogs.map((log) => (
              <li key={log.id}>
                [{log.createdAt}] {log.action} by {log.actorId} on {log.targetId}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

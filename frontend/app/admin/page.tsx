/**
 * v0.4.1 — Admin Dashboard
 *
 * Upgraded from v0.4.0: Now includes user management endpoints.
 * - List all users (/admin/users)
 * - Modify user roles (/admin/users/:id/role)
 *
 * VULN (v0.4.1-v0.4.2): 
 *   - Client-side AuthContext check (isAdmin flag) — can be bypassed via localStorage
 *   - All emails exposed (CWE-200)
 *   - Unbounded user list (CWE-400)
 *   - No audit trail on role changes (CWE-862)
 *   - Role from JWT trusted without DB re-validation (CWE-639)
 *
 * v0.4.2 CWE-639 Demonstration:
 *   The isAdmin check below redirects to '/' if not admin. However:
 *   1. This check happens client-side after page load has started
 *   2. A user can bypass it by modifying localStorage to set role='admin'
 *   3. The JWT payload is visible in DevTools (base64, not encrypted)
 *   4. If an attacker knows the JWT secret 'kc-secret', they can forge a JWT with role='admin'
 *   5. Set it in localStorage → refresh → isAdmin becomes true
 *   6. This page renders, but it's the backend protection that matters:
 *      If the forged JWT is valid, /admin/* endpoints ACCEPT it (bug in HasRole guard)
 *   7. This is CWE-639: The backend trusts the JWT role claim without DB re-check
 *
 * Backend authorization (v0.4.1-v0.4.2): JwtAuthGuard + HasRole guard
 * Backend vulnerabilities: See admin.controller.ts, admin.service.ts, has-role.guard.ts
 */
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
  // v0.4.0: Client-side role check — redirect non-admins to home
  // VULN (CWE-639): This check can be bypassed by modifying localStorage
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

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

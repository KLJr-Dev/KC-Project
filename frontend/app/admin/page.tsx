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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { adminCreate, adminList, adminListUsers } from '../../lib/api';
import { AdminUserList } from '../components/admin-user-list';
import type { AdminResponse } from '../../lib/types';
import type { AdminUser, GetAdminUsersResponse } from '../../lib/api';

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  // Old admin item list (v0.4.0)
  const [items, setItems] = useState<AdminResponse[]>([]);

  // New user management (v0.4.1)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  // Error/success state
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [role, setRole] = useState('');
  const [createResult, setCreateResult] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'users' | 'legacy'>('users');

  // v0.4.0: Client-side role check — redirect non-admins to home
  // VULN (CWE-639): This check can be bypassed by modifying localStorage
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Load old admin items
  const loadAdminItems = () => {
    setError(null);
    adminList()
      .then(setItems)
      .catch((e) => setError(String(e)));
  };

  // Load new admin users (v0.4.1)
  const loadAdminUsers = async () => {
    setUsersLoading(true);
    setError(null);
    try {
      const res: GetAdminUsersResponse = await adminListUsers();
      setAdminUsers(res.users);
      setUserCount(res.count);
    } catch (err) {
      setError(`Failed to load users: ${String(err)}`);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadAdminItems();
    loadAdminUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateResult(null);
    setError(null);
    try {
      const res = await adminCreate({ label, role });
      setCreateResult(JSON.stringify(res, null, 2));
      setLabel('');
      setRole('');
      loadAdminItems();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    // Update local state immediately
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // Optionally reload to confirm with backend
    setTimeout(() => loadAdminUsers(), 1000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-black dark:text-zinc-100">Admin Dashboard</h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          👥 User Management (v0.4.1)
        </button>
        <button
          onClick={() => setActiveTab('legacy')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'legacy'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          📋 Legacy Admin Items (v0.4.0)
        </button>
      </div>

      {/* User Management Tab (v0.4.1) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 dark:bg-blue-950/30 dark:border-blue-900">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              User Management
            </h2>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              List all users and modify their roles. <br />
              <strong>Vulnerabilities:</strong> CWE-639 (JWT role trusted), CWE-862 (missing
              auth checks), CWE-200 (email exposure), CWE-400 (unbounded list)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold text-zinc-700 dark:text-zinc-300">
                All Users ({userCount})
              </h3>
              <button
                onClick={loadAdminUsers}
                disabled={usersLoading}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
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
        </div>
      )}

      {/* Legacy Admin Items Tab (v0.4.0) */}
      {activeTab === 'legacy' && (
        <div className="space-y-8">
          {/* Create */}
          <form onSubmit={handleCreate} className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              POST /admin (legacy)
            </h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                type="text"
                placeholder="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
              >
                Create
              </button>
            </div>
            {createResult && (
              <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                {createResult}
              </pre>
            )}
          </form>

          {/* List */}
          <div>
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              GET /admin (legacy)
            </h2>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-400">No admin entries.</p>
            ) : (
              <table className="mt-2 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium text-zinc-500">ID</th>
                    <th className="py-2 pr-4 font-medium text-zinc-500">Label</th>
                    <th className="py-2 pr-4 font-medium text-zinc-500">Role</th>
                    <th className="py-2 font-medium text-zinc-500">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/admin/${a.id}`}
                          className="text-blue-600 underline dark:text-blue-400"
                        >
                          {a.id}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 font-mono">{a.label ?? '—'}</td>
                      <td className="py-2 pr-4 font-mono">{a.role ?? '—'}</td>
                      <td className="py-2 font-mono text-zinc-400">{a.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

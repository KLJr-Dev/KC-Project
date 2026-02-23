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
import { adminListUsers } from '../../lib/api';
import { AdminUserList } from '@/app/components/admin-user-list';
import type { AdminUser, GetAdminUsersResponse } from '../../lib/api';

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  // New user management (v0.4.1)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  // Error/success state
  const [error, setError] = useState<string | null>(null);
  // v0.4.0: Client-side role check — redirect non-admins to home
  // VULN (CWE-639): This check can be bypassed by modifying localStorage
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

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
    loadAdminUsers();
  }, []);

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
    </div>
  );
}

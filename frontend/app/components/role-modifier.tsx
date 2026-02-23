/**
 * v0.4.1 — Role Modifier Component
 *
 * Allows admins to change a user's role from user <-> admin.
 * Communicates with adminUpdateUserRole() API function.
 *
 * CWE-862: No additional authorization checks beyond admin role.
 * CWE-532: No audit trail (changes logged to stdout only in backend).
 */
'use client';

import { useState } from 'react';
import type { AdminUser } from '../../lib/api';
import { adminUpdateUserRole } from '../../lib/api';

interface RoleModifierProps {
  user: AdminUser;
  onRoleChange?: (newRole: 'user' | 'admin') => void;
}

export function RoleModifier({ user, onRoleChange }: RoleModifierProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const newRole = user.role === 'admin' ? 'user' : 'admin';

  const handleRoleChange = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await adminUpdateUserRole(user.id, newRole);
      setSuccess(`User role updated to "${newRole}"`);
      // Call parent callback after a short delay so success message is visible
      setTimeout(() => onRoleChange?.(newRole), 500);
    } catch (err) {
      setError(`Failed to update role: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded border border-blue-200 p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">
          Update Role for {user.username}
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Current role: <span className="font-mono font-bold">{user.role}</span>
          <br />
          New role: <span className="font-mono font-bold text-blue-600">{newRole}</span>
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Success display */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
          {success}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRoleChange}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold transition"
        >
          {isLoading ? 'Updating...' : `Promote to ${newRole.toUpperCase()}`}
        </button>
      </div>

      {/* Vulnerability note */}
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <strong>Vulnerability Note:</strong> This role change has no audit trail and takes
        effect immediately. (CWE-862: Missing Authorization, CWE-532: Sensitive Data
        Exposure in Log Files)
      </div>
    </div>
  );
}

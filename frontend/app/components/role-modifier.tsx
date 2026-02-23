/**
 * v0.4.1-v0.4.3 — Role Modifier Component
 *
 * v0.4.1: Allowed admins to toggle user <-> admin.
 * v0.4.3: Enhanced to support ternary role system (user, moderator, admin).
 *         Now shows a dropdown to select specific role.
 *
 * VULN (v0.4.3): No audit trail or confirmation prompts.
 *       Role changes are instantaneous and permanent (CWE-532).
 *       No role hierarchy documentation — ambiguous whether moderator
 *       can promote to admin or only other admins can (CWE-841).
 * 
 * VULN (v0.4.2-v0.4.3): CWE-639 exposed via frontend — if an attacker
 *       modifies localStorage to set role='admin', this component will
 *       show role change buttons (UI-only protection, backend guards matter).
 */
'use client';

import { useState } from 'react';
import type { AdminUser } from '../../lib/api';
import { adminUpdateUserRole } from '../../lib/api';

interface RoleModifierProps {
  user: AdminUser;
  onRoleChange?: (newRole: 'user' | 'moderator' | 'admin') => void;
}

export function RoleModifier({ user, onRoleChange }: RoleModifierProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'moderator' | 'admin'>(user.role);

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      setError('Please select a different role');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await adminUpdateUserRole(user.id, selectedRole);
      setSuccess(`User role updated to "${selectedRole}"`);
      // Call parent callback after a short delay so success message is visible
      setTimeout(() => onRoleChange?.(selectedRole), 500);
    } catch (err) {
      setError(`Failed to update role: ${String(err)}`);
      // Reset selected role on error
      setSelectedRole(user.role);
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
        </p>
      </div>

      {/* Role selector dropdown */}
      <div className="mb-3">
        <label className="block text-sm font-semibold mb-2">Select new role:</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as 'user' | 'moderator' | 'admin')}
          disabled={isLoading}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100"
        >
          <option value="user">User (regular access)</option>
          <option value="moderator">Moderator (file approval)</option>
          <option value="admin">Admin (full access)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {selectedRole === 'user' && 'Regular user with minimal permissions'}
          {selectedRole === 'moderator' && 'Can approve/reject file uploads'}
          {selectedRole === 'admin' && 'Full administrative access'}
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

      {/* Action button */}
      <div className="flex gap-2">
        <button
          onClick={handleRoleChange}
          disabled={isLoading || selectedRole === user.role}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold transition"
        >
          {isLoading ? 'Updating...' : 'Update Role'}
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

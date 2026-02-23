/**
 * v0.4.1 — Admin User List Component
 *
 * Displays all users in a table with email, username, role, and actions.
 * Allows admins to modify user roles via RoleModifier component.
 *
 * CWE-200: This component displays all user emails to any admin.
 * CWE-400: No pagination on the user list (will show all users).
 * CWE-639: Role visibility is based on JWT payload (trusts token).
 */
'use client';

import { useState } from 'react';
import type { AdminUser } from '../../lib/api';
import { RoleModifier } from './role-modifier';

interface AdminUserListProps {
  users: AdminUser[];
  onRoleChange?: (userId: string, newRole: 'user' | 'admin') => void;
  isLoading?: boolean;
}

export function AdminUserList({
  users,
  onRoleChange,
  isLoading = false,
}: AdminUserListProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading users...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="p-4 text-gray-500">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto border border-gray-300 rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-4 py-2 text-left font-semibold">ID</th>
            <th className="px-4 py-2 text-left font-semibold">Email</th>
            <th className="px-4 py-2 text-left font-semibold">Username</th>
            <th className="px-4 py-2 text-left font-semibold">Role</th>
            <th className="px-4 py-2 text-left font-semibold">Created</th>
            <th className="px-4 py-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2 text-xs font-mono text-gray-600">
                {user.id.substring(0, 8)}...
              </td>
              <td className="px-4 py-2">
                {/* CWE-200: Email exposed in admin panel */}
                <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                  {user.email}
                </a>
              </td>
              <td className="px-4 py-2">{user.username}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                {/* Role modifier button */}
                <button
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                  onClick={() =>
                    setExpandedUserId(expandedUserId === user.id ? null : user.id)
                  }
                >
                  {expandedUserId === user.id ? 'Cancel' : 'Change Role'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Inline role modifier for selected user */}
      {expandedUserId && (
        <div className="bg-blue-50 border-t-2 border-blue-300 p-4">
          {(() => {
            const selectedUser = users.find((u) => u.id === expandedUserId);
            return selectedUser ? (
              <RoleModifier
                user={selectedUser}
                onRoleChange={(newRole) => {
                  onRoleChange?.(selectedUser.id, newRole);
                  setExpandedUserId(null);
                }}
              />
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

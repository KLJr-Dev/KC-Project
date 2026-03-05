'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usersCreate, usersList, ValidationError } from '../../lib/api';
import type { UserResponse } from '../../lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [createResult, setCreateResult] = useState<string | null>(null);

  const load = () => {
    setError(null);
    usersList()
      .then(setUsers)
      .catch((e) => setError(String(e)));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateResult(null);
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string | null> = {
      email: email ? (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email format' : null) : 'Email is required',
      username: username ? (username.length < 3 ? 'Min 3 characters' : username.length > 50 ? 'Max 50 characters' : null) : 'Username required',
      password: password ? null : 'Password required',
    };
    
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    try {
      const res = await usersCreate({ email, username, password });
      setCreateResult(JSON.stringify(res, null, 2));
      setEmail('');
      setUsername('');
      setPassword('');
      setFieldErrors({});
      load();
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors: Record<string, string | null> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          errors[field] = messages && messages.length > 0 ? messages[0] : null;
        }
        setFieldErrors(errors);
        setError('Please check the highlighted fields');
      } else {
        setError(String(err));
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">Users</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">POST /users</h2>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`rounded border px-3 py-1.5 text-sm dark:bg-zinc-900 ${
                fieldErrors.email
                  ? 'border-red-500 dark:border-red-600'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`rounded border px-3 py-1.5 text-sm dark:bg-zinc-900 ${
                fieldErrors.username
                  ? 'border-red-500 dark:border-red-600'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            <input
              type="text"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`rounded border px-3 py-1.5 text-sm dark:bg-zinc-900 ${
                fieldErrors.password
                  ? 'border-red-500 dark:border-red-600'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            <button
              type="submit"
              className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
            >
              Create
            </button>
          </div>
          {Object.entries(fieldErrors).map(
            ([field, error]) =>
              error && (
                <p key={field} className="text-xs text-red-600 dark:text-red-400">
                  {field}: {error}
                </p>
              ),
          )}
        </div>
        {createResult && (
          <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {createResult}
          </pre>
        )}
      </form>

      {/* User list */}
      <div>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">GET /users</h2>
        {users.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No users.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium text-zinc-500">ID</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">Email</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">Username</th>
                <th className="py-2 font-medium text-zinc-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/users/${u.id}`}
                      className="text-blue-600 underline dark:text-blue-400"
                    >
                      {u.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 font-mono">{u.email ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono">{u.username ?? '—'}</td>
                  <td className="py-2 font-mono text-zinc-400">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersGetById, usersUpdate, usersDelete } from '../../../lib/api';
import type { UserResponse } from '../../../lib/types';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // edit form
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setError(null);
    usersGetById(id)
      .then((u) => {
        setUser(u);
        setEmail(u.email ?? '');
        setUsername(u.username ?? '');
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    try {
      const res = await usersUpdate(id, { email, username, password });
      setResult(JSON.stringify(res, null, 2));
      setUser(res);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      const res = await usersDelete(id);
      setResult(JSON.stringify(res, null, 2));
      setTimeout(() => router.push('/users'), 600);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">User {id}</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {user && (
        <pre className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {JSON.stringify(user, null, 2)}
        </pre>
      )}

      {/* Update form */}
      <form onSubmit={handleUpdate} className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">PUT /users/{id}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
          >
            Update
          </button>
        </div>
      </form>

      {/* Delete */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">DELETE /users/{id}</h2>
        <button
          onClick={handleDelete}
          className="rounded bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      {result && (
        <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {result}
        </pre>
      )}
    </div>
  );
}

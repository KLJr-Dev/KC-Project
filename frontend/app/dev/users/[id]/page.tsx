'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usersGetById, usersUpdate, usersDelete } from '../../../../lib/api';
import type { UserResponse } from '../../../../lib/types';

export default function DevUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

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
      setTimeout(() => router.push('/dev/users'), 600);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-8">
      <Link href="/dev/users" className="text-sm text-muted underline hover:text-foreground">
        ← Back to Users explorer
      </Link>
      <h1 className="text-xl font-semibold text-foreground">User {id}</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {user && (
        <pre className="rounded border border-border bg-muted/30 p-3 text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      )}

      <form onSubmit={handleUpdate} className="space-y-3">
        <h2 className="text-sm font-medium text-muted">PUT /users/{id}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm"
          />
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm"
          />
          <input
            type="text"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground"
          >
            Update
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted">DELETE /users/{id}</h2>
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

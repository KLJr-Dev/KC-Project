'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ping } from '../lib/api';

type BackendStatus = 'unknown' | 'connected' | 'error';

const SECTIONS = [
  {
    href: '/users',
    label: 'Users',
    description: 'CRUD operations on the users resource',
  },
  {
    href: '/auth',
    label: 'Auth',
    description: 'Register and login forms',
  },
  {
    href: '/files',
    label: 'Files',
    description: 'Upload metadata, view, and delete stubs',
  },
  {
    href: '/admin',
    label: 'Admin',
    description: 'Administrative resource CRUD',
  },
  {
    href: '/sharing',
    label: 'Sharing',
    description: 'Share links CRUD',
  },
];

export default function Dashboard() {
  const [status, setStatus] = useState<BackendStatus>('unknown');

  useEffect(() => {
    ping()
      .then(() => setStatus('connected'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-100">
          KC-Project Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          v0.0.7 — Frontend ↔ Backend Contract Integration
        </p>
      </div>

      <div className="flex items-center gap-3 rounded border border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            status === 'connected'
              ? 'bg-green-500'
              : status === 'error'
                ? 'bg-red-500'
                : 'bg-zinc-400 animate-pulse'
          }`}
        />
        <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
          Backend ({`localhost:4000`}): {status === 'unknown' && 'checking…'}
          {status === 'connected' && 'connected'}
          {status === 'error' && 'unreachable'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <h2 className="font-medium text-black dark:text-zinc-100">{s.label}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

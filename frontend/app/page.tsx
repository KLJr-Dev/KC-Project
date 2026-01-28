'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type BackendStatus = 'unknown' | 'connected' | 'error';

export default function Home() {
  /**
   * v0.0.5 – Frontend ↔ Backend reachability test
   *
   * Purpose:
   * - Verify frontend can issue HTTP requests
   * - Verify backend responds
   * - Surface networking / CORS failures visibly
   *
   * This is NOT production UI.
   */
  const [status, setStatus] = useState<BackendStatus>('unknown');

  useEffect(() => {
    fetch('http://localhost:4000/ping')
      .then((res) => res.json())
      .then((data) => {
        console.log('[v0.0.5] Backend reachable:', data);
        setStatus('connected');
      })
      .catch((err) => {
        console.error('[v0.0.5] Backend unreachable:', err);
        setStatus('error');
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-12 py-32 px-16 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            KC-Project Frontend
          </h1>

          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Backend status:{' '}
            <span className="font-mono">
              {status === 'unknown' && 'checking…'}
              {status === 'connected' && 'connected'}
              {status === 'error' && 'unreachable'}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
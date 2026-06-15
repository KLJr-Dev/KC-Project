'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sharingPublicUrl } from '../../../lib/api';

export default function PublicSharePage() {
  const { token } = useParams<{ token: string }>();
  const downloadUrl = sharingPublicUrl(token);

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Shared file</h1>
      <p className="text-sm text-muted">
        This link was shared with you. No login is required to download.
      </p>
      <a
        href={downloadUrl}
        className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        Download file
      </a>
      <p className="text-xs text-muted">
        <Link href="/" className="underline hover:text-foreground">
          Go to KC-Project home
        </Link>
      </p>
    </div>
  );
}

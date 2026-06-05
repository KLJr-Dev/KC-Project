import Link from 'next/link';

const EXPLORERS = [
  { href: '/dev/files', title: 'Files', desc: 'POST /files, GET /files, download' },
  { href: '/dev/users', title: 'Users', desc: 'POST /users, GET /users' },
  { href: '/dev/sharing', title: 'Sharing', desc: 'POST /sharing, public tokens' },
];

export default function DevHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">API Explorer</h1>
        <p className="mt-2 text-sm text-muted">
          Raw contract verification UI for pentesters. Product flows live on the main nav.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {EXPLORERS.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="rounded-lg border border-border p-5 transition-colors hover:border-foreground/30"
          >
            <h2 className="font-medium text-foreground">{e.title}</h2>
            <p className="mt-1 text-sm text-muted">{e.desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted">
        OpenAPI:{' '}
        <a href="/api/docs" target="_blank" rel="noreferrer" className="text-foreground underline">
          /api/docs
        </a>{' '}
        (Docker: <code className="text-xs">:8080/api/docs</code>) · CWE inventory in{' '}
        <code className="text-xs">docs/security/cwe-inventory.md</code>
      </p>
    </div>
  );
}

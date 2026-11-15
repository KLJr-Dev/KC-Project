import { isLabUiEnabled } from '../../lib/lab-flags';

export default function Footer() {
  const labUi = isLabUiEnabled();

  return (
    <footer className="border-t border-border bg-surface/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <span className="text-xs text-muted">
          Northwind Traders · Internal · 1.10.0
        </span>
        <div className="flex gap-4 text-xs text-muted">
          {labUi && (
            <a href="/dev" className="hover:text-foreground">
              API Explorer
            </a>
          )}
          <span>Document Portal</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

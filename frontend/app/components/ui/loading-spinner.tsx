export default function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      {label}
    </div>
  );
}

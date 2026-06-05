export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-xs text-muted">KC-Project v1.0.0</span>
        <div className="flex gap-4 text-xs text-muted">
          <a href="/dev" className="hover:text-foreground">
            API Explorer
          </a>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

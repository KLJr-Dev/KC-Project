export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-xs text-muted">KC-Project</span>
        <span className="text-xs text-muted">&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

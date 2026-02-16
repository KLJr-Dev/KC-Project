interface ErrorBannerProps {
  message: string | null;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
      {message}
    </div>
  );
}

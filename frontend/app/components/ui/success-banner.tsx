interface SuccessBannerProps {
  message: string | null;
}

export default function SuccessBanner({ message }: SuccessBannerProps) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
      {message}
    </div>
  );
}

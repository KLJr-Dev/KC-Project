'use client';

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
}

export default function SubmitButton({
  children,
  loading = false,
  disabled = false,
  loadingText = 'Please wait…',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? loadingText : children}
    </button>
  );
}

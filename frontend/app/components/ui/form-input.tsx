'use client';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  autoComplete?: string;
}

export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  error,
  disabled = false,
  autoComplete,
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`block w-full rounded-md border px-3 py-2 text-sm text-foreground placeholder:text-muted bg-background transition-colors ${
          error ? 'border-error' : 'border-border'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

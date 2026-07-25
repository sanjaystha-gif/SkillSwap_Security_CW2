interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}

export default function FormField({ label, id, error, helper, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
      {helper && (
        <p className="text-ink3 text-xs mt-1">{helper}</p>
      )}
    </div>
  );
}

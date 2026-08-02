import React, { type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  helper?: string;
  children: ReactNode;
}

export default function FormField({ label, id, error, helper, children }: FormFieldProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">
        {label}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children, { 'aria-describedby': describedBy })
        : children}
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
      {helper && (
        <p id={helperId} className="text-ink3 text-xs mt-1">
          {helper}
        </p>
      )}
    </div>
  );
}

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50';
  
  const variants = {
    primary: 'bg-teal-950 text-white shadow-sm hover:bg-teal-900',
    secondary: 'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200',
    danger: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
    ghost: 'bg-transparent text-teal-950 hover:bg-slate-50',
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      aria-busy={loading}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <>
          <span
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

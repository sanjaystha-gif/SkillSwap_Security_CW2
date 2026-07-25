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
  const baseStyles = 'px-4 py-2 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600';
  
  const variants = {
    primary: 'bg-teal-950 text-white hover:bg-teal-900',
    secondary: 'bg-stone-200 text-ink hover:bg-stone-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-teal-950 hover:bg-teal-50',
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

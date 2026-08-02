import { useState, useEffect } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    setStrength(Math.min(score, 5));
  }, [password]);

  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const barStyles = ['bg-stone-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="mt-2" role="status" aria-live="polite">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i <= strength ? barStyles[i] : 'bg-stone-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-ink2">{labels[strength]}</p>
    </div>
  );
}

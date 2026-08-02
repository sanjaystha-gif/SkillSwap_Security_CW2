import { ArrowRightLeft } from 'lucide-react';

interface CreditChipProps {
  value: number | string;
  className?: string;
}

export default function CreditChip({ value, className = '' }: CreditChipProps): JSX.Element {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 shadow-sm ${className}`.trim()}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
        <ArrowRightLeft className="h-3.5 w-3.5" />
      </span>
      <span className="font-mono tracking-[0.2em]">{formattedValue}</span>
    </span>
  );
}

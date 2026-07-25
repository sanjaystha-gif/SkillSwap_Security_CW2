interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    requested: 'bg-amber-100 text-amber-900',
    confirmed: 'bg-blue-100 text-blue-900',
    completed: 'bg-green-100 text-green-900',
    cancelled: 'bg-red-100 text-red-900',
    disputed: 'bg-amber-50 border border-amber-300 text-amber-900',
    active: 'bg-green-100 text-green-900',
    inactive: 'bg-stone-100 text-stone-900',
    pending: 'bg-blue-100 text-blue-900',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-stone-100'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

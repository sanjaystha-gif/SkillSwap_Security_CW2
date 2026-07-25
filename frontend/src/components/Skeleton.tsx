interface SkeletonProps {
  variant?: 'card' | 'table' | 'profile' | 'text';
  count?: number;
}

export default function Skeleton({ variant = 'card', count = 1 }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="bg-stone-200 rounded h-32 animate-pulse" />
    );
  }
  if (variant === 'table') {
    return (
      <div className="space-y-2">
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className="bg-stone-200 rounded h-12 animate-pulse" />
        ))}
      </div>
    );
  }
  if (variant === 'profile') {
    return (
      <div className="space-y-4">
        <div className="bg-stone-200 rounded-full h-16 w-16 animate-pulse" />
        <div className="bg-stone-200 rounded h-6 w-32 animate-pulse" />
        <div className="bg-stone-200 rounded h-4 w-full animate-pulse" />
      </div>
    );
  }
  return <div className="bg-stone-200 rounded h-4 animate-pulse" />;
}

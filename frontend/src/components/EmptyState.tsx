interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-ink2 mb-6">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-4 py-2 bg-teal-950 text-white rounded hover:bg-teal-900"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

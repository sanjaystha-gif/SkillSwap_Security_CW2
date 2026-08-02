import { useToast } from '../context/ToastContext';

export default function ToastContainer(): JSX.Element {
  const { toasts, removeToast } = useToast();

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-amber-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-slate-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3" aria-live="polite" role="status">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex max-w-xs items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${getBgColor(toast.type)}`}
        >
          <span className={`text-xl font-bold ${getTextColor(toast.type)}`} aria-hidden="true">
            {getIcon(toast.type)}
          </span>
          <p className={`max-w-[16rem] break-words text-sm font-medium ${getTextColor(toast.type)}`}>{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className={`ml-2 text-lg font-bold transition hover:opacity-70 ${getTextColor(toast.type)}`}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

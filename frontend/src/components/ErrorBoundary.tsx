import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-4">
          <div className="mx-auto max-w-md py-12">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm" role="alert" aria-live="assertive">
              <h1 className="text-2xl font-semibold text-red-950">Oops!</h1>
              <p className="mt-3 text-red-800">
                Something went wrong. Please try again or contact support if the problem persists.
              </p>
              <div className="mt-4">
                <p className="text-xs font-mono text-red-700">{this.state.error?.message}</p>
              </div>
              <button
                type="button"
                onClick={this.reset}
                className="mt-6 w-full rounded-2xl bg-red-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

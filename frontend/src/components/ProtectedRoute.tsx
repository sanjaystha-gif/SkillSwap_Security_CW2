import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from './Skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-700">
        <Skeleton variant="profile" />
        <p className="mt-4">Loading session...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

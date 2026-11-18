import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../../store/authStore.js';
import { Spinner } from '../ui/Spinner.js';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-gray-500">Restoring session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
}

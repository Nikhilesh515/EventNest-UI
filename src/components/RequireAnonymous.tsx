import { Navigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';

export function RequireAnonymous({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
}

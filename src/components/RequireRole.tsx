import { Navigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';
import { hasRole } from '../lib/permissions';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(user, roles)) return <Navigate to="/events" replace />;

  return <>{children}</>;
}

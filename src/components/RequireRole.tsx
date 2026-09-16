import { Navigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/events" replace />;

  return <>{children}</>;
}

import { useEffect } from 'react';
import { Navigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuthStore } from '../lib/auth-store';
import { hasRole } from '../lib/permissions';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const user = useAuthStore((s) => s.user);
  const allowed = user ? hasRole(user, roles) : false;

  useEffect(() => {
    if (user && !allowed) {
      toast.error("You don't have permission to view that page.", { id: 'role-denied' });
    }
  }, [user, allowed]);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/events" replace />;

  return <>{children}</>;
}

import { Navigate } from "react-router";
import { useAuthStore } from "../lib/auth-store";

export function RequireAnonymous({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  if (isBootstrapping) {
    return (
      <div className="boot-gate" aria-busy="true" role="status">
        <span className="koi-loader__text">Checking your session…</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
}

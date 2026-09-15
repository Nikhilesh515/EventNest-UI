import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function ShellClassManager() {
  const location = useLocation();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    document.documentElement.classList.toggle('shell-cover', isCover);
    return () => {
      document.documentElement.classList.remove('shell-cover');
    };
  }, [isCover]);

  return null;
}

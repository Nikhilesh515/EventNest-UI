import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from './lib/query-provider';
import App from './App';

// Hydrate auth state from localStorage
import { useAuthStore } from './lib/auth-store';
useAuthStore.getState().hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);

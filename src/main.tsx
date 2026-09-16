import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./lib/query-provider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppToaster } from "./components/AppToaster";
import App from "./App";

import { useAuthStore } from "./lib/auth-store";
void useAuthStore.getState().bootstrap();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <App />
      </QueryProvider>
      <AppToaster />
    </ErrorBoundary>
  </StrictMode>,
);

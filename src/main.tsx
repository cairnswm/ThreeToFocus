import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TenantProvider } from "./auth/context/TenantContext";
import { AuthenticationProvider } from "./auth/context/AuthContext";
import SettingsProvider from "./auth/context/SettingsContext.tsx";
import { SubscriptionsProvider } from "./auth/context/SubscriptionsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TenantProvider applicationId="950ef1d9-c657-11ed-95d1-f0a654c38aa6">
      <AuthenticationProvider>
        <SettingsProvider>
          <SubscriptionsProvider>
            <App />
          </SubscriptionsProvider>
        </SettingsProvider>
      </AuthenticationProvider>
    </TenantProvider>
  </StrictMode>
);

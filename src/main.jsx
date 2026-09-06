import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import { SaaSProvider } from "./context/SaaSContext";
import { ScannerProvider } from "./context/ScannerContext";
import { GlobalErrorProvider } from "./context/GlobalErrorContext";
import "./index.css";
import "./chapters9to12.css";
import "./chapters16to26.css";
import "./masterConsolidation.css";
import "./aiOwnerAssistant.css";
import "./globalError.css";

// V5_PREVIEW_SERVICE_WORKER_ISOLATION
// Production root keeps its service worker. The additive /v3-preview/ build
// never registers one, and only removes an old registration whose own scope is
// already /v3-preview/. It never unregisters the production-root registration.
const isolatedPreview =
  import.meta.env.VITE_PREVIEW_MODE === "1" ||
  window.location.pathname.startsWith("/v3-preview/");

if ("serviceWorker" in navigator) {
  if (isolatedPreview) {
    window.addEventListener("load", async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter((registration) => {
              try {
                return new URL(registration.scope).pathname.startsWith("/v3-preview/");
              } catch {
                return false;
              }
            })
            .map((registration) => registration.unregister()),
        );
      } catch (error) {
        console.warn("V3 preview service-worker cleanup skipped", error);
      }
    });
  } else {
    window.addEventListener("load", () =>
      navigator.serviceWorker.register("./sw.js").catch(console.error),
    );
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <GlobalErrorProvider>
        <AuthProvider>
          <SaaSProvider>
            <ScannerProvider>
              <ShopProvider><App/></ShopProvider>
            </ScannerProvider>
          </SaaSProvider>
        </AuthProvider>
      </GlobalErrorProvider>
    </HashRouter>
  </StrictMode>
);

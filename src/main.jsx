import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import { ScannerProvider } from "./context/ScannerContext";
import "./index.css";
import "./chapters9to12.css";
import "./chapters16to26.css";
import "./masterConsolidation.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ScannerProvider>
          <ShopProvider><App/></ShopProvider>
        </ScannerProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);

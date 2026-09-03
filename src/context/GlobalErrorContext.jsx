import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import GlobalErrorDialog from "../components/ui/GlobalErrorDialog";

const GlobalErrorContext = createContext(null);

function toErrorPayload(error, options = {}) {
  const rawMessage =
    error?.message ||
    error?.error_description ||
    (typeof error === "string" ? error : "") ||
    "An unexpected error occurred.";

  const details = [
    options.details,
    error?.details,
    error?.hint ? `Hint: ${error.hint}` : "",
    error?.code ? `Code: ${error.code}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: options.title || "Something went wrong",
    message: String(rawMessage),
    details: String(details || ""),
  };
}

export function GlobalErrorProvider({ children }) {
  const [currentError, setCurrentError] = useState(null);

  const showError = useCallback((error, options = {}) => {
    setCurrentError(toErrorPayload(error, options));
  }, []);

  const closeError = useCallback(() => {
    setCurrentError(null);
  }, []);

  useEffect(() => {
    function onWindowError(event) {
      if (!event?.error && !event?.message) return;
      showError(event.error || event.message, {
        title: "Application error",
      });
    }

    function onUnhandledRejection(event) {
      showError(event?.reason || "Unhandled application error", {
        title: "Unexpected application error",
      });
    }

    function onReportedError(event) {
      const detail = event?.detail || {};
      showError(detail.error || detail.message || "Application error", detail);
    }

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("wineshop:app-error", onReportedError);

    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("wineshop:app-error", onReportedError);
    };
  }, [showError]);

  const value = useMemo(
    () => ({ showError, closeError }),
    [showError, closeError],
  );

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
      <GlobalErrorDialog
        open={Boolean(currentError)}
        title={currentError?.title}
        message={currentError?.message}
        details={currentError?.details}
        onClose={closeError}
      />
    </GlobalErrorContext.Provider>
  );
}

export function useGlobalError() {
  const value = useContext(GlobalErrorContext);
  if (!value) {
    throw new Error("useGlobalError must be used inside GlobalErrorProvider");
  }
  return value;
}

export function reportGlobalError(error, options = {}) {
  window.dispatchEvent(
    new CustomEvent("wineshop:app-error", {
      detail: { ...options, error },
    }),
  );
}

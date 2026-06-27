import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { INK, PAPER } from "../utils/constants";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 100,
          pointerEvents: "none",
          padding: "0 16px",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              maxWidth: 420,
              width: "100%",
              background: INK,
              color: PAPER,
              borderRadius: 10,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13.5,
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              animation: "slideUp 0.2s ease-out",
            }}
          >
            {t.type === "success" && <CheckCircle2 size={16} color="#8FD19E" />}
            {t.type === "error" && <AlertCircle size={16} color="#E89B8B" />}
            {t.type === "info" && <Info size={16} color="#9FC9D6" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: "none", border: "none", color: PAPER, cursor: "pointer", opacity: 0.7, padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
